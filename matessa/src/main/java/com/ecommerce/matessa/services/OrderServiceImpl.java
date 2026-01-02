package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.models.PaymentMode;
import com.ecommerce.matessa.models.PaymentStatus;
import com.ecommerce.matessa.payLoad.*;
import com.ecommerce.matessa.repositories.*;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired CartRepository cartRepository;
    @Autowired AddressRepository addressRepository;
    @Autowired OrderItemRepository orderItemRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired ProductRepository productRepository;
    @Autowired UserRepository userRepository;
    @Autowired ModelMapper modelMapper;

    @Autowired CartItemRepository cartItemRepository;

    @Override
    @Transactional
    public OrderDTO placeOrder(String email, String sessionId, OrderRequestDTO orderRequest) {

        // --- 1. FIND CART ---
        Cart cart = null;
        if (sessionId != null) cart = cartRepository.findBySessionId(sessionId);
        if (cart == null && email != null) cart = cartRepository.findCartByEmail(email);

        if (cart == null) throw new ResourceExceptionHandler("Cart", "email/session", email);
        if (cart.getCartItems().isEmpty()) throw new ApisExceptionHandler("Cart is empty");

        // --- 2. ADDRESS ---
        // Use your helper method if you prefer, or the mapper logic here
        Address address = modelMapper.map(orderRequest.getShippingAddress(), Address.class);

        // Link address to user if logged in (Optional but good for history)
        if (cart.getUser() != null) {
            address.setUser(cart.getUser());
        }
        address = addressRepository.save(address);

        // --- 3. ORDER HEADER ---
        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setEmail(email);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus(OrderStatus.PLACED);
        order.setAddress(address);

        // ✅ FIX: CALCULATE FRESH TOTAL
        // Do NOT use cart.getTotalPrice(). Calculate it fresh to ensure it matches the items perfectly.
        double freshTotal = cart.getCartItems().stream()
                .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                .sum();

        // Re-apply coupon if valid
        if (cart.getDiscountCoupon() != null) {
            freshTotal = freshTotal - cart.getDiscountCoupon();
        }

        // Set the corrected total
        order.setTotalAmount(freshTotal > 0 ? freshTotal : 0.0);

        if (cart.getUser() != null) {
            order.setUser(cart.getUser());
        }

        Order savedOrder = orderRepository.save(order);

        // --- 4. PAYMENT ---
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        PaymentMode mode = PaymentMode.valueOf(orderRequest.getPaymentMode().toUpperCase());
        payment.setPaymentMode(mode);

        if (mode == PaymentMode.ONLINE) {
            payment.setPgPaymentId(orderRequest.getPgPaymentId());
            payment.setPgStatus(PaymentStatus.SUCCESS);
            payment.setPgResponseMessage(orderRequest.getPgResponseMessage());
            payment.setPgName(orderRequest.getPgName());
        } else {
            payment.setPgStatus(PaymentStatus.PENDING);
            payment.setPgResponseMessage("Cash on Delivery");
            payment.setPgName("COD");
        }
        paymentRepository.save(payment);
        savedOrder.setPayment(payment);
        savedOrder = orderRepository.save(savedOrder);

        // --- 5. ORDER ITEMS ---
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());

            // ✅ Save the same price we used for calculation
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());

            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);

        // --- 6. STOCK UPDATE ---
        cart.getCartItems().forEach(item -> {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        });

        // Force flush to ensure Order is safe before touching Cart
        orderRepository.flush();

        // --- 7. CLEANUP CART ---
        // Safely empty the cart (works for both Guests and Users without crashing Hibernate)
        cart.getCartItems().clear();
        cart.setTotalPrice(0.0);
        cart.setCouponCode(null);
        cart.setDiscountCoupon(0.0);

        if (cart.getUser() == null) {
            cart.setSessionId(null); // Unlink guest session
        }

        cartRepository.save(cart);

        // --- 8. RESPONSE ---
        return modelMapper.map(savedOrder, OrderDTO.class);
    }
    @Override
    @Transactional
    public OrderDTO getOrder(Long orderId) {
        // 1. Fetch Order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceExceptionHandler("Order", "orderId", orderId));

        // 2. Map basic fields
        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);

        // 3. ✅ CRITICAL FIX: MANUALLY MAP THE ITEMS
        // ModelMapper often fails with Lazy Lists. We map it manually to be 100% sure.
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<OrderItemDTO> itemDTOs = order.getOrderItems().stream().map(item -> {
                OrderItemDTO dto = new OrderItemDTO();

                // Map simple fields
                dto.setOrderItemId(item.getOrderItemId());
                dto.setQuantity(item.getQuantity());
                dto.setOrderedProductPrice(item.getOrderedProductPrice());

                // Map Product details manually (Safety check)
                if (item.getProduct() != null) {
                    ProductDTO productDTO = new ProductDTO();
                    productDTO.setProductId(item.getProduct().getProductId());
                    productDTO.setProductName(item.getProduct().getProductName());
                    productDTO.setImages(item.getProduct().getImages());

                    // Map the single image fallback too (optional, but good for safety)
                    productDTO.setImage(item.getProduct().getImage());
                    // Add other product fields if needed
                    dto.setProduct(productDTO);
                }
                return dto;
            }).collect(Collectors.toList());

            orderDTO.setOrderItems(itemDTOs); // Set the manually mapped list
        }

        // 4. Map Address
        if (order.getAddress() != null) {
            orderDTO.setAddress(modelMapper.map(order.getAddress(), AddressDTO.class));
        }

        return orderDTO;
    }

    @Override
    @Transactional // <--- IMPORTANT HERE TOO
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .map(order -> {
                    // ✅ Force Fetch for every order in the list
                    if (order.getOrderItems() != null) {
                        order.getOrderItems().size();
                    }

                    OrderDTO dto = modelMapper.map(order, OrderDTO.class);
                    if (order.getAddress() != null) {
                        dto.setAddress(modelMapper.map(order.getAddress(), AddressDTO.class));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByEmail(String email) {
        List<Order> orders = orderRepository.findByEmail(email);

        if (orders.isEmpty()) {
            throw new ResourceExceptionHandler("Orders", "email", email);
        }

        return orders.stream()
                .map(order -> {
                    OrderDTO dto = modelMapper.map(order, OrderDTO.class);
                    dto.setAddress(modelMapper.map(order.getAddress(), AddressDTO.class));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO updateOrderUser(Long orderId, String status) {
        // 1. Find Order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceExceptionHandler("Order", "orderId", orderId));

        // 2. Update Status (Handle Enum conversion carefully)
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setOrderStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new ApisExceptionHandler("Invalid Status: " + status);
        }

        // 3. SAVE and capture the UPDATED object
        Order updatedOrder = orderRepository.save(order);

        // 4. Map the UPDATED object to DTO
        return modelMapper.map(updatedOrder, OrderDTO.class);
    }

// ... inside your OrderService class

    private String generateOrderCode() {
        Random random = new Random();
        // Generates a number between 0 and 99999
        int number = random.nextInt(100000);

        // Formats it to 5 digits, padding with zeros if necessary
        // Example: 12 -> "MA00012"
        return String.format("MA%05d", number);
    }
}