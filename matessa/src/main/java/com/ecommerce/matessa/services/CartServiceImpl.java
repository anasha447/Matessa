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
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public CartDTO addProductToCart(Long productId, Integer quantity, String email, String sessionId) {
        // 1. Find or Create the Cart based on Identity
        Cart cart = getOrCreateCart(email, sessionId);

        // 2. Locate the Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // 3. Check if Item already exists in THIS specific cart
        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cart.getCartId(), productId);

        if (cartItem != null) {
            // ✅ CHANGE: Instead of throwing exception, UPDATE QUANTITY
            // throw new ApisExceptionHandler("Product " + product.getProductName() + " already exists in the cart");

            // Check Stock for total quantity
            int newQuantity = cartItem.getQuantity() + quantity;
            if (product.getQuantity() < newQuantity) {
                 throw new ApisExceptionHandler("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
            }

            cartItem.setQuantity(newQuantity);
            // Update price in case product price changed (optional, but good practice)
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setDiscount(product.getDiscount());

            cartItemRepository.save(cartItem);
        } else {
            // 4. Stock Validations
            if (product.getQuantity() == 0) {
                throw new ApisExceptionHandler(product.getProductName() + " is not available");
            }

            if (product.getQuantity() < quantity) {
                throw new ApisExceptionHandler("Please, make an order of the " + product.getProductName()
                        + " less than or equal to the quantity " + product.getQuantity() + ".");
            }

            // 5. Create new Cart Item
            cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(cart);
            cartItem.setQuantity(quantity);
            cartItem.setDiscount(product.getDiscount());
            cartItem.setProductPrice(product.getSpecialPrice());

            cartItemRepository.save(cartItem);

            // IMPORTANT: Add to the cart's list so recalculation works immediately in this transaction
            cart.getCartItems().add(cartItem);
        }

        // 6. Recalculate Total (Instead of incremental update)
        recalculateCartTotal(cart);

        // 7. Convert to DTO
        return mapToCartDTO(cart);
    }

    /**
     * HELPER: Recalculates total price from scratch based on items.
     */
    private void recalculateCartTotal(Cart cart) {
        double total = 0.0;
        for (CartItem item : cart.getCartItems()) {
            total += (item.getProductPrice() * item.getQuantity());
        }
        cart.setTotalPrice(total);
        cartRepository.save(cart);
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
        Cart cart = null;

        if (email != null) {
            cart = cartRepository.findCartByEmailAndCartId(email, cartId);
        }

        if (cart == null && sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId);
        }

        if (cart == null) {
            throw new ResourceExceptionHandler("Cart", "cartId", cartId);
        }

        // Recalculate on fetch just to be safe? (Optional, but ensures consistency)
        // recalculateCartTotal(cart);

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

            // Check stock
            if (product.getQuantity() < newQuantity) {
                 throw new ApisExceptionHandler("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
            }

            // ✅ CHANGE: Recalculate Total (Instead of incremental)
            // cart.setTotalPrice(cart.getTotalPrice() + (cartItem.getProductPrice() * quantity));

            cartRepository.save(cart);
            cartItemRepository.save(cartItem);

            recalculateCartTotal(cart);
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

        // ✅ CHANGE: Remove item from list and recalculate
        // cart.setTotalPrice(cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity()));

        cart.getCartItems().remove(cartItem);
        cartItemRepository.deleteCartItemByProductIdAndCartId(cartId, productId);

        recalculateCartTotal(cart);

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

        cartItem.setProductPrice(product.getSpecialPrice());
        cartItemRepository.save(cartItem);

        // ✅ CHANGE: Recalculate Total
        recalculateCartTotal(cart);
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
        if (sessionId == null) return;
        Cart guestCart = cartRepository.findBySessionId(sessionId);
        if (guestCart == null) return;

        Cart userCart = cartRepository.findCartByEmail(email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceExceptionHandler("User", "email", email));

        if (userCart == null) {
            guestCart.setSessionId(null);
            guestCart.setUser(user);
            cartRepository.save(guestCart);
        } else {
            List<CartItem> guestItems = guestCart.getCartItems();

            for (CartItem guestItem : guestItems) {
                Product product = guestItem.getProduct();

                CartItem existingUserItem = cartItemRepository.findCartItemByProductIdAndCartId(userCart.getCartId(), product.getProductId());

                if (existingUserItem != null) {
                    existingUserItem.setQuantity(existingUserItem.getQuantity() + guestItem.getQuantity());
                    existingUserItem.setProductPrice(product.getSpecialPrice());
                } else {
                    CartItem newItem = new CartItem();
                    newItem.setProduct(product);
                    newItem.setCart(userCart);
                    newItem.setQuantity(guestItem.getQuantity());
                    newItem.setDiscount(product.getDiscount());
                    newItem.setProductPrice(product.getSpecialPrice());
                    cartItemRepository.save(newItem);
                    userCart.getCartItems().add(newItem); // Add to list for recalculation
                }
            }

            cartItemRepository.deleteAll(guestCart.getCartItems());
            cartRepository.delete(guestCart);

            // ✅ CHANGE: Recalculate
            recalculateCartTotal(userCart);
        }
    }
}
