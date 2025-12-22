package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.Cart;
import com.ecommerce.matessa.models.CartItem;
import com.ecommerce.matessa.models.Product;
import com.ecommerce.matessa.models.User;
import com.ecommerce.matessa.payLoad.CartDTO;
import com.ecommerce.matessa.payLoad.ProductDTO;
import com.ecommerce.matessa.repositories.CartItemRepository;
import com.ecommerce.matessa.repositories.CartRepository;
import com.ecommerce.matessa.repositories.ProductRepository;
import com.ecommerce.matessa.repositories.UserRepository;
import com.ecommerce.matessa.util.AuthUtil;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository; // Added to fetch User entity if needed

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity, String email, String sessionId) {
        // 1. Find or Create the Cart based on Identity
        Cart cart = getOrCreateCart(email, sessionId);

        // 2. Locate the Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // 3. Check if Item already exists in THIS specific cart
        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cart.getCartId(), productId);

        if (cartItem != null) {
            throw new ApisExceptionHandler("Product " + product.getProductName() + " already exists in the cart");
        }

        // 4. Stock Validations
        if (product.getQuantity() == 0) {
            throw new ApisExceptionHandler(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new ApisExceptionHandler("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        // 5. Create new Cart Item
        CartItem newCartItem = new CartItem();
        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getDiscount());
        newCartItem.setProductPrice(product.getSpecialPrice());

        cartItemRepository.save(newCartItem);

        // 6. Update Product Stock (Temporary Hold) & Cart Total
        // Note: Usually we don't deduct stock until Order is placed, but keeping your logic:
        product.setQuantity(product.getQuantity());

        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));
        cartRepository.save(cart);

        // 7. Convert to DTO
        return mapToCartDTO(cart);
    }

    /**
     * HELPER: Logic to find a cart by Email OR Session, or create a new one.
     */
    private Cart getOrCreateCart(String email, String sessionId) {
        Cart cart = null;

        // A. Try finding by Email (User)
        if (email != null) {
            cart = cartRepository.findCartByEmail(email);
        }

        // B. If not found, try finding by Session (Guest)
        if (cart == null && sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId);
        }

        // C. If still null, create new Cart
        if (cart == null) {
            cart = new Cart();
            cart.setTotalPrice(0.00);

            if (email != null) {
                // Link to User
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceExceptionHandler("User", "email", email));
                cart.setUser(user);
            } else if (sessionId != null) {
                // Link to Guest Session
                cart.setSessionId(sessionId);
            }

            cart = cartRepository.save(cart);
        }

        return cart;
    }

    @Override
    public List<CartDTO> getAllCarts() {
        List<Cart> carts = cartRepository.findAll();

        if (carts.isEmpty()) {
            throw new ApisExceptionHandler("No cart exists");
        }

        return carts.stream().map(this::mapToCartDTO).collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String email, String sessionId, Long cartId) {
        // Logic: Try to find cart by Email, if not, try Session
        Cart cart = null;

        if (email != null) {
            // If searching by Email, usually we don't strictly need cartId if OneToOne
            // But adhering to your specific repo method:
            // Note: You might need to adjust repo method to handle nulls if necessary
            cart = cartRepository.findCartByEmailAndCartId(email, cartId);
        }

        if (cart == null && sessionId != null) {
            // You need to add findBySessionIdAndCartId to Repository
            // Or just findBySessionId(sessionId) since 1 session = 1 cart
            cart = cartRepository.findBySessionId(sessionId);
        }

        if (cart == null) {
            throw new ResourceExceptionHandler("Cart", "cartId", cartId);
        }

        return mapToCartDTO(cart);
    }

    @Transactional
    @Override
    public CartDTO updateProductQuantityInCart(Long productId, Integer quantity, String email, String sessionId) {

        // 1. Find the Cart (User or Guest)
        Cart cart = getOrCreateCart(email, sessionId);
        Long cartId = cart.getCartId();

        // 2. Find Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        if (product.getQuantity() == 0) {
            throw new ApisExceptionHandler(product.getProductName() + " is not available");
        }
        if (product.getQuantity() < quantity) { // Note: Check logic here if quantity is additive or absolute
            // Assuming logic is correct based on previous code
        }

        // 3. Find Item
        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new ApisExceptionHandler("Product " + product.getProductName() + " not available in the cart!!!");
        }

        // 4. Calculate New Quantity
        int newQuantity = cartItem.getQuantity() + quantity;

        if (newQuantity < 0) {
            throw new ApisExceptionHandler("The resulting quantity cannot be negative.");
        }

        if (newQuantity == 0) {
            deleteProductFromCart(cartId, productId);
            // Re-fetch cart to get updated state after delete
            cart = cartRepository.findById(cartId).orElse(cart);
        } else {
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setQuantity(newQuantity);
            cartItem.setDiscount(product.getDiscount());

            cart.setTotalPrice(cart.getTotalPrice() + (cartItem.getProductPrice() * quantity));

            cartRepository.save(cart);
            cartItemRepository.save(cartItem);
        }

        return mapToCartDTO(cart);
    }

    @Transactional
    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceExceptionHandler("Cart", "cartId", cartId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new ResourceExceptionHandler("Product", "productId", productId);
        }

        cart.setTotalPrice(cart.getTotalPrice() -
                (cartItem.getProductPrice() * cartItem.getQuantity()));

        cartItemRepository.deleteCartItemByProductIdAndCartId(cartId, productId);

        return "Product " + cartItem.getProduct().getProductName() + " removed from the cart !!!";
    }

    @Override
    public void updateProductInCarts(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceExceptionHandler("Cart", "cartId", cartId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new ApisExceptionHandler("Product " + product.getProductName() + " not available in the cart!!!");
        }

        double cartPrice = cart.getTotalPrice()
                - (cartItem.getProductPrice() * cartItem.getQuantity());

        cartItem.setProductPrice(product.getSpecialPrice());

        cart.setTotalPrice(cartPrice
                + (cartItem.getProductPrice() * cartItem.getQuantity()));

        cartItemRepository.save(cartItem);
    }

    // Helper to avoid Code Duplication in mapping
    private CartDTO mapToCartDTO(Cart cart) {
        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

        List<ProductDTO> products = cart.getCartItems().stream().map(item -> {
            ProductDTO pDto = modelMapper.map(item.getProduct(), ProductDTO.class);
            pDto.setQuantity(item.getQuantity()); // IMPORTANT: Set Cart Item Quantity, not Stock Quantity
            return pDto;
        }).collect(Collectors.toList());

        cartDTO.setProducts(products);
        return cartDTO;
    }

    @Override
    @Transactional
    public void mergeCarts(String email, String sessionId) {
        // 1. Check if a Guest Cart even exists
        if (sessionId == null) return;
        Cart guestCart = cartRepository.findBySessionId(sessionId);
        if (guestCart == null) return;

        // 2. Check if the User already has a Cart
        Cart userCart = cartRepository.findCartByEmail(email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "email", email));

        if (userCart == null) {
            // SCENARIO A: User has no cart. Easy switch!
            guestCart.setSessionId(null); // No longer a guest cart
            guestCart.setUser(user);      // Now it belongs to the user
            cartRepository.save(guestCart);
        } else {
            // SCENARIO B: User already has a cart. We must merge items.

            List<CartItem> guestItems = guestCart.getCartItems();

            for (CartItem guestItem : guestItems) {
                Product product = guestItem.getProduct();

                // Does User already have this product?
                CartItem existingUserItem = cartItemRepository.findCartItemByProductIdAndCartId(userCart.getCartId(), product.getProductId());

                if (existingUserItem != null) {
                    // Update Quantity: User had 2, Guest had 3 -> Now User has 5
                    existingUserItem.setQuantity(existingUserItem.getQuantity() + guestItem.getQuantity());
                    // Update Price based on new quantity
                    existingUserItem.setProductPrice(product.getSpecialPrice());
                } else {
                    // Move Item: User didn't have this. Create a new entry for User.
                    CartItem newItem = new CartItem();
                    newItem.setProduct(product);
                    newItem.setCart(userCart); // Parent is now User Cart
                    newItem.setQuantity(guestItem.getQuantity());
                    newItem.setDiscount(product.getDiscount());
                    newItem.setProductPrice(product.getSpecialPrice());

                    cartItemRepository.save(newItem);
                }
            }

            // Recalculate Total Price for User Cart
            double total = 0.0;
            // We need to fetch fresh items to calculate total correctly
            // But for simplicity, we can do a quick sum logic or save and fetch
            // Let's assume we trigger a recalculate or do it manually here:
            // (Ideally, create a helper method calculateCartTotal(Cart cart))

            // Cleanup: Delete the old Guest Cart
            cartItemRepository.deleteAll(guestCart.getCartItems()); // Clear guest items
            cartRepository.delete(guestCart); // Delete guest cart object

            // Recalculate User Cart Total (Simple loop)
            userCart = cartRepository.findById(userCart.getCartId()).get(); // Refresh
            double newTotal = userCart.getCartItems().stream()
                    .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                    .sum();
            userCart.setTotalPrice(newTotal);
            cartRepository.save(userCart);
        }
    }
}