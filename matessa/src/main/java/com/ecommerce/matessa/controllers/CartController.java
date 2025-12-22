package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.models.Cart;
import com.ecommerce.matessa.payLoad.CartDTO;
import com.ecommerce.matessa.repositories.CartRepository;
import com.ecommerce.matessa.services.CartService;
import com.ecommerce.matessa.util.AuthUtil;
import com.ecommerce.matessa.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CookieUtil cookieUtil; // ✅ 1. Inject CookieUtil

    // Helper method to safely get email or null (for Guest logic)
    private String getLoggedInEmailOrNull() {
        try {
            return authUtil.loggedInEmail();
        } catch (Exception e) {
            return null; // User is not logged in -> Treat as Guest
        }
    }

    @PostMapping("/public/carts/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductToCart(@PathVariable Long productId,
                                                    @PathVariable Integer quantity,
                                                    HttpServletRequest request,   // ✅ Needed for reading cookies
                                                    HttpServletResponse response) { // ✅ Needed for writing cookies

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response); // Get Cookie

        // ✅ Pass all 4 arguments now
        CartDTO cartDTO = cartService.addProductToCart(productId, quantity, email, sessionId);

        return new ResponseEntity<>(cartDTO, HttpStatus.CREATED);
    }

    @GetMapping("/admin/carts")
    public ResponseEntity<List<CartDTO>> getCarts() {
        // This is an Admin method, usually doesn't need guest logic unless you want to see ALL guest carts too
        List<CartDTO> cartDTOs = cartService.getAllCarts();
        return new ResponseEntity<>(cartDTOs, HttpStatus.FOUND);
    }

    @GetMapping("/public/carts/users/cart")
    public ResponseEntity<CartDTO> getCartById(HttpServletRequest request, HttpServletResponse response) {

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response);

        Cart cart = null;

        // 1. Try finding by Email
        if (email != null) {
            cart = cartRepository.findCartByEmail(email);
        }

        // 2. If not found, try finding by Session
        if (cart == null && sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId); // Ensure this method exists in Repository!
        }

        // 3. Handle empty cart scenario
        if (cart == null) {
            // Depending on frontend logic, you might want to return an empty DTO or Create one
            // For now, let's allow the Service to handle the "Not Found" error or create one
            // We pass 0L as ID if cart is null, service will handle creation logic if you prefer
            // But based on your Service code, it expects a valid ID for 'getCart'.
            // So we return "No Content" if cart doesn't exist yet.
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        // ✅ Pass arguments to service
        CartDTO cartDTO = cartService.getCart(email, sessionId, cart.getCartId());

        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    @PutMapping("/public/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation,
                                                     HttpServletRequest request,
                                                     HttpServletResponse response) {

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response);

        int qty = operation.equalsIgnoreCase("delete") ? -1 : 1;

        // ✅ Pass all 4 arguments
        CartDTO cartDTO = cartService.updateProductQuantityInCart(productId, qty, email, sessionId);

        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    @DeleteMapping("/public/carts/{cartId}/product/{productId}")
    public ResponseEntity<String> deleteProductFromCart(@PathVariable Long cartId,
                                                        @PathVariable Long productId) {

        // Delete functionality usually doesn't require session logic if we have the specific Cart ID
        String status = cartService.deleteProductFromCart(cartId, productId);

        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}