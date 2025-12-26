package com.ecommerce.matessa;

import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.repositories.*;
import com.ecommerce.matessa.services.CartServiceImpl;
import com.ecommerce.matessa.services.OrderServiceImpl;
import com.ecommerce.matessa.payLoad.CartDTO;
import com.ecommerce.matessa.payLoad.OrderDTO;
import com.ecommerce.matessa.payLoad.OrderRequestDTO;
import com.ecommerce.matessa.payLoad.ProductDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private CartServiceImpl cartService;

    // We can also test OrderService here or separate file, but for simplicity let's stick to CartServiceImpl first
    // as it's the main logic change. I'll mock OrderService tests separately or here if easy.
    // Let's stick to CartService.

    @BeforeEach
    void setUp() {
        // Common Mocks
        lenient().when(modelMapper.map(any(), eq(CartDTO.class))).thenReturn(new CartDTO());
        lenient().when(modelMapper.map(any(Product.class), eq(ProductDTO.class))).thenReturn(new ProductDTO());
    }

    @Test
    void testAddProductToCart_RecalculatesTotal() {
        // Setup
        Long productId = 1L;
        Product product = new Product();
        product.setProductId(productId);
        product.setSpecialPrice(100.0);
        product.setDiscount(0.0);
        product.setQuantity(10);
        product.setProductName("Test Product");

        Cart cart = new Cart();
        cart.setCartId(1L);
        cart.setTotalPrice(0.0);
        cart.setCartItems(new ArrayList<>());

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findCartByEmail("test@test.com")).thenReturn(cart);

        // Act
        cartService.addProductToCart(productId, 2, "test@test.com", null);

        // Assert: Total should be 200.0
        assertEquals(200.0, cart.getTotalPrice());
    }

    @Test
    void testAddProductToCart_ExistingProduct_UpdatesQuantity() {
         // Setup
        Long productId = 1L;
        Product product = new Product();
        product.setProductId(productId);
        product.setSpecialPrice(100.0);
        product.setDiscount(0.0);
        product.setQuantity(10);
        product.setProductName("Test Product");

        Cart cart = new Cart();
        cart.setCartId(1L);
        cart.setTotalPrice(100.0);

        // Existing Item
        CartItem existingItem = new CartItem();
        existingItem.setCartItemId(1L);
        existingItem.setProduct(product);
        existingItem.setQuantity(1);
        existingItem.setProductPrice(100.0);
        existingItem.setCart(cart);

        cart.getCartItems().add(existingItem); // Add to list

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cartRepository.findCartByEmail("test@test.com")).thenReturn(cart);
        when(cartItemRepository.findCartItemByProductIdAndCartId(1L, 1L)).thenReturn(existingItem);

        // Act: Add 2 more
        cartService.addProductToCart(productId, 2, "test@test.com", null);

        // Assert
        assertEquals(3, existingItem.getQuantity()); // 1 + 2 = 3
        assertEquals(300.0, cart.getTotalPrice());   // 3 * 100 = 300
    }
}
