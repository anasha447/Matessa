package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.CartDTO;
import jakarta.transaction.Transactional;
import java.util.List;

public interface CartService {

    // ✅ FIX: Added 'Long variantId' as the 5th argument
    CartDTO addProductToCart(Long productId, Integer quantity, String email, String sessionId, Long variantId);

    List<CartDTO> getAllCarts();

    CartDTO getCart(String email, String sessionId, Long cartId);



    @Transactional
    CartDTO updateProductQuantityInCart(Long productId, Integer quantity, String email, String sessionId, Long variantId);

    CartDTO deleteProductFromCart(Long cartId, Long productId, String variant);

    void updateProductInCarts(Long cartId, Long productId);

    void mergeCarts(String email, String sessionId);

    CartDTO applyCoupon(Long cartId, String code);

    CartDTO removeCoupon(Long cartId);
}