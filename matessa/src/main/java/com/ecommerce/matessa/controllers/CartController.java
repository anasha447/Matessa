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
    private CookieUtil cookieUtil;

    // Helper: Safely get email or null (Guest logic)
    private String getLoggedInEmailOrNull() {
        try {
            return authUtil.loggedInEmail();
        } catch (Exception e) {
            return null; // Not logged in -> Guest
        }
    }

    // ✅ 1. ADD TO CART (Supports Optional Variant)
    // If a product has no variant, frontend sends nothing, and 'variantId' becomes null.
    // The Service handles null by using the default Product price.
    @PostMapping("/public/carts/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductToCart(
            @PathVariable Long productId,
            @PathVariable Integer quantity,
            @RequestParam(required = false) Long variantId, // Optional!
            HttpServletRequest request,
            HttpServletResponse response) {

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response);

        CartDTO cartDTO = cartService.addProductToCart(productId, quantity, email, sessionId, variantId);

        return new ResponseEntity<>(cartDTO, HttpStatus.CREATED);
    }

    // ✅ 2. GET CART (User or Guest)
    @GetMapping("/public/carts/users/cart")
    public ResponseEntity<CartDTO> getCartById(HttpServletRequest request, HttpServletResponse response) {

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response);

        Cart cart = null;

        // Try finding by Email first
        if (email != null) {
            cart = cartRepository.findCartByEmail(email);
        }

        // If not found, try finding by Session
        if (cart == null && sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId);
        }

        // If no cart exists yet, return 204 No Content
        if (cart == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        CartDTO cartDTO = cartService.getCart(email, sessionId, cart.getCartId());

        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    // ✅ 3. UPDATE QUANTITY
    @PutMapping("/public/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation,
                                                     @RequestParam(required = false) Long variantId,
                                                     HttpServletRequest request,
                                                     HttpServletResponse response) {

        String email = getLoggedInEmailOrNull();
        String sessionId = cookieUtil.getOrGenerateGuestId(request, response);

        int qty = operation.equalsIgnoreCase("delete") ? -1 : 1;

        CartDTO cartDTO = cartService.updateProductQuantityInCart(productId, qty, email, sessionId, variantId);

        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    // ✅ 4. REMOVE ITEM (Supports Optional Variant)
    // If you remove a product without a variant, 'variant' param is null.
    // The Service knows to look for the "default" item.
    @DeleteMapping("/public/carts/{cartId}/product/{productId}")
// ✅ Change return type from <String> to <CartDTO>
    public ResponseEntity<CartDTO> deleteProductFromCart(@PathVariable Long cartId,
                                                         @PathVariable Long productId,
                                                         @RequestParam(required = false) String variant) {

        // ✅ Capture the CartDTO object
        CartDTO updatedCart = cartService.deleteProductFromCart(cartId, productId, variant);

        // ✅ Return the object so Frontend gets the new price
        return new ResponseEntity<>(updatedCart, HttpStatus.OK);
    }

    // ✅ 5. ADMIN GET ALL
    @GetMapping("/admin/carts")
    public ResponseEntity<List<CartDTO>> getCarts() {
        List<CartDTO> cartDTOs = cartService.getAllCarts();
        return new ResponseEntity<>(cartDTOs, HttpStatus.FOUND);
    }
    
    @PostMapping("/public/carts/{cartId}/coupon/{code}")
    public ResponseEntity<CartDTO> applyCoupon(@PathVariable Long cartId, @PathVariable String code) {
        CartDTO cartDTO = cartService.applyCoupon(cartId, code);
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }
    @DeleteMapping("/public/carts/{cartId}/coupon")
    public ResponseEntity<CartDTO> removeCoupon(@PathVariable Long cartId) {
        CartDTO cartDTO = cartService.removeCoupon(cartId);
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }
}