package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.CartDTO;
import jakarta.transaction.Transactional;

import java.util.List;

public interface CartService {

    // Updated: Now accepts email AND sessionId to determine if it's a User or Guest
    CartDTO addProductToCart(Long productId, Integer quantity, String email, String sessionId);

    List<CartDTO> getAllCarts();

    // Updated: Now looks for cart by email OR session, then validates with cartId
    CartDTO getCart(String email, String sessionId, Long cartId);

    // Updated: Need to know WHO is updating the quantity (User or Guest)
    @Transactional
    CartDTO updateProductQuantityInCart(Long productId, Integer quantity, String email, String sessionId);

    String deleteProductFromCart(Long cartId, Long productId);

    void updateProductInCarts(Long cartId, Long productId);

    void mergeCarts(String email, String sessionId);
}