package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.payLoad.CartDTO;
import com.ecommerce.matessa.payLoad.ProductDTO;
import com.ecommerce.matessa.repositories.*;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ModelMapper modelMapper;
    @Autowired private ProductVariantRepository productVariantRepository;
    @Autowired private CouponRepository couponRepository;

    // =====================================================================
    // CORE CART OPERATIONS
    // =====================================================================

    @Override
    @Transactional
    public CartDTO addProductToCart(Long productId, Integer quantity, String email, String sessionId, Long variantId) {
        // 1. Find or Create Cart
        Cart cart = getOrCreateCart(email, sessionId);

        // 2. Locate Product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        // 3. Determine Price, Stock & Variant

        // ✅ FIX: Use getPrice() (Regular), NOT getSpecialPrice()
        // We want to store the RAW price (e.g. 100) so the math works correctly later.
        double priceToUse = product.getPrice();

        int stockAvailable = product.getQuantity();
        String variantName = null;

        if (variantId != null && variantId != 0) {
            ProductVariant variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceExceptionHandler("Variant", "variantId", variantId));

            if (!variant.getProduct().getProductId().equals(productId)) {
                throw new ApisExceptionHandler("Variant does not match the product!");
            }
            // Ensure this returns the Regular Price of the variant
            priceToUse = variant.getPrice();
            stockAvailable = variant.getStock();
            variantName = variant.getName();
        }

        // 4. Check if Item Exists
        CartItem cartItem;
        if (variantName != null) {
            cartItem = cartItemRepository.findCartItemByProductIdAndVariantAndCartId(cart.getCartId(), productId, variantName);
        } else {
            cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cart.getCartId(), productId);
        }

        if (cartItem != null) {
            // Update Existing
            int newQuantity = cartItem.getQuantity() + quantity;
            if (stockAvailable < newQuantity) {
                throw new ApisExceptionHandler("Only " + stockAvailable + " items left in stock.");
            }
            cartItem.setQuantity(newQuantity);
            cartItem.setProductPrice(priceToUse); // Update to Regular Price
            cartItem.setDiscount(product.getDiscount());
            cartItemRepository.save(cartItem);
        } else {
            // Create New
            if (stockAvailable < quantity) {
                throw new ApisExceptionHandler("Only " + stockAvailable + " items left in stock.");
            }
            cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(cart);
            cartItem.setQuantity(quantity);
            cartItem.setDiscount(product.getDiscount());

            // ✅ Stores Regular Price (e.g. 100)
            cartItem.setProductPrice(priceToUse);

            cartItem.setVariant(variantName);
            cartItemRepository.save(cartItem);
            cart.getCartItems().add(cartItem);
        }

        // 5. Recalculate & Map (This applies the discount logic ONCE)
        recalculateCartTotal(cart);
        return mapToCartDTO(cart);
    }

    @Transactional
    @Override
    public CartDTO updateProductQuantityInCart(Long productId, Integer quantity, String email, String sessionId, Long variantId) {
        Cart cart = getOrCreateCart(email, sessionId);
        Long cartId = cart.getCartId();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceExceptionHandler("Product", "productId", productId));

        if (product.getQuantity() == 0) throw new ApisExceptionHandler("Product not available");

        String variantName = null;
        double priceToUse = product.getSpecialPrice();
        int stockAvailable = product.getQuantity();

        if (variantId != null && variantId != 0) {
            ProductVariant pv = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceExceptionHandler("Variant", "variantId", variantId));
            variantName = pv.getName();
            priceToUse = pv.getPrice();
            stockAvailable = pv.getStock();
        }

        CartItem cartItem;
        if (variantName != null) {
            cartItem = cartItemRepository.findCartItemByProductIdAndVariantAndCartId(cartId, productId, variantName);
        } else {
            cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);
        }

        if (cartItem == null) throw new ApisExceptionHandler("Product not found in cart");

        int newQuantity = cartItem.getQuantity() + quantity;

        if (newQuantity <= 0) {
            deleteProductFromCart(cartId, productId, cartItem.getVariant());
            cart = cartRepository.findById(cartId).orElse(cart); // Refresh
        } else {
            if (stockAvailable < newQuantity) {
                throw new ApisExceptionHandler("Stock limit reached: " + stockAvailable);
            }
            cartItem.setProductPrice(priceToUse);
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
            recalculateCartTotal(cart);
        }

        return mapToCartDTO(cart);
    }

    @Override
    @Transactional
    public CartDTO deleteProductFromCart(Long cartId, Long productId, String variant) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceExceptionHandler("Cart", "cartId", cartId));

        CartItem cartItem;

        // 1. Find and Delete the specific item
        if (variant != null) {
            cartItem = cartItemRepository.findCartItemByProductIdAndVariantAndCartId(cartId, productId, variant);
            if (cartItem != null)
                cartItemRepository.deleteCartItemByProductIdAndVariantAndCartId(cartId, productId, variant);
        } else {
            cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);
            if (cartItem != null)
                cartItemRepository.deleteCartItemByProductIdAndCartId(cartId, productId);
        }

        if (cartItem == null) throw new ResourceExceptionHandler("CartItem", "productId", productId);

        // 2. Remove from memory list so recalculation works immediately
        cart.getCartItems().remove(cartItem);

        // 3. Recalculate Totals (Updates the price in DB)
        recalculateCartTotal(cart);

        // ✅ 4. Return the UPDATED Cart (This sends the new price to React)
        // Was: return "Product removed";
        return mapToCartDTO(cart);
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
        recalculateCartTotal(cart);
    }

    @Override
    public List<CartDTO> getAllCarts() {
        List<Cart> carts = cartRepository.findAll();
        if (carts.isEmpty()) throw new ApisExceptionHandler("No cart exists");
        return carts.stream().map(this::mapToCartDTO).collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String email, String sessionId, Long cartId) {
        Cart cart = null;
        if (email != null) cart = cartRepository.findCartByEmailAndCartId(email, cartId);
        if (cart == null && sessionId != null) cart = cartRepository.findBySessionId(sessionId);

        if (cart == null) throw new ResourceExceptionHandler("Cart", "cartId", cartId);

        // Optional: Recalculate on fetch to ensure coupon validity
        // recalculateCartTotal(cart);

        return mapToCartDTO(cart);
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
                    userCart.getCartItems().add(newItem);
                }
            }
            cartItemRepository.deleteAll(guestCart.getCartItems());
            cartRepository.delete(guestCart);
            recalculateCartTotal(userCart);
        }
    }

    // =====================================================================
    // COUPON LOGIC
    // =====================================================================

    @Override
    @Transactional
    public CartDTO applyCoupon(Long cartId, String code) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceExceptionHandler("Cart", "cartId", cartId));

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ApisExceptionHandler("Invalid Coupon Code!"));

        if (!coupon.isActive()) {
            throw new ApisExceptionHandler("Coupon is expired or inactive.");
        }

        cart.setCouponCode(coupon.getCode());

        // Use the unified calculation logic
        recalculateCartTotal(cart);

        Cart savedCart = cartRepository.save(cart);
        return mapToCartDTO(savedCart);
    }

    // =====================================================================
    // 🧮 UNIFIED CALCULATION LOGIC
    // =====================================================================

    // This is the SINGLE math engine for the whole service.
    // It handles Variants, Base Price Ratios, and Coupons all in one go.
    private void recalculateCartTotal(Cart cart) {
        // 1. Calculate Subtotal (Item Price * Quantity)
        double subtotal = cart.getCartItems().stream()
                .mapToDouble(item -> {
                    // A. Variant Price (e.g. 200.00) stored on the Item
                    double variantPrice = item.getProductPrice();

                    // B. Base Product Prices
                    double basePrice = item.getProduct().getPrice();
                    double baseSpecial = item.getProduct().getSpecialPrice();

                    double finalItemPrice = variantPrice;

                    // C. Discount Ratio Logic:
                    // If the Base Product is on sale (e.g. 20% off), apply that same % to the Variant
                    if (baseSpecial > 0 && basePrice > 0) {
                        double discountRatio = baseSpecial / basePrice;
                        finalItemPrice = variantPrice * discountRatio;
                    }

                    return finalItemPrice * item.getQuantity();
                })
                .sum();

        // 2. Calculate Coupon Discount on the Subtotal
        double discountAmount = 0.0;
        if (cart.getCouponCode() != null && !cart.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(cart.getCouponCode()).orElse(null);

            if (coupon != null && coupon.isActive()) {
                discountAmount = subtotal * (coupon.getDiscountPercentage() / 100.0);
            } else {
                cart.setCouponCode(null); // Remove invalid
            }
        }

        // 3. Update Cart
        cart.setDiscountCoupon(discountAmount);
        double finalTotal = subtotal - discountAmount;
        cart.setTotalPrice(finalTotal > 0 ? finalTotal : 0.0);

        cartRepository.save(cart);
    }

    // =====================================================================
    // 🗺️ HELPERS
    // =====================================================================

    private Cart getOrCreateCart(String email, String sessionId) {
        Cart cart = null;
        if (email != null) {
            cart = cartRepository.findCartByEmail(email);
            if (cart != null && cart.getSessionId() != null) {
                cart.setSessionId(null);
                cartRepository.save(cart);
            }
        }
        if (cart == null && sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId);
        }
        if (cart == null) {
            cart = new Cart();
            cart.setTotalPrice(0.00);
            if (email != null) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceExceptionHandler("User", "email", email));
                cart.setUser(user);
                cart.setSessionId(null);
            } else if (sessionId != null) {
                cart.setSessionId(sessionId);
            }
            cart = cartRepository.save(cart);
        }
        return cart;
    }

    private CartDTO mapToCartDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();
        cartDTO.setCartId(cart.getCartId());
        cartDTO.setTotalPrice(cart.getTotalPrice());
        cartDTO.setDiscount(cart.getDiscountCoupon());
        cartDTO.setCouponCode(cart.getCouponCode());

        List<ProductDTO> productDTOs = cart.getCartItems().stream()
                .map(this::mapToItemDTO)
                .collect(Collectors.toList());

        cartDTO.setProducts(productDTOs);
        return cartDTO;
    }

    private ProductDTO mapToItemDTO(CartItem item) {
        ProductDTO dto = modelMapper.map(item, ProductDTO.class);

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getProductId());
            dto.setProductName(item.getProduct().getProductName());

            // Ensure Product entity has 'image' field for this to work
            dto.setImages(item.getProduct().getImages());
            // Price Logic for Display
            dto.setPrice(item.getProductPrice()); // Variant Price

            double basePrice = item.getProduct().getPrice();
            double baseSpecial = item.getProduct().getSpecialPrice();

            if (baseSpecial > 0 && basePrice > 0) {
                double ratio = baseSpecial / basePrice;
                dto.setSpecialPrice(item.getProductPrice() * ratio);
            } else {
                dto.setSpecialPrice(0.0);
            }

            dto.setDiscount(item.getProduct().getDiscount());

            // Explicitly set quantity and variant from CartItem
            dto.setQuantity(item.getQuantity());
            dto.setVariant(item.getVariant());
        }
        return dto;
    }
    @Override
    @Transactional
    public CartDTO removeCoupon(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceExceptionHandler("Cart", "cartId", cartId));

        // 1. Clear the Code
        // Setting this to null tells recalculateCartTotal to remove the discount logic
        cart.setCouponCode(null);

        // 2. Recalculate & Save
        // This calculates the new total (without discount) AND saves to DB
        recalculateCartTotal(cart);

        // 3. Return Mapped DTO
        return mapToCartDTO(cart);
    }

}