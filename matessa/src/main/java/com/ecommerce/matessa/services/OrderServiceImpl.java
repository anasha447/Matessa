package com.ecommerce.matessa.services;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.exceptionHandler.ResourceExceptionHandler;
import com.ecommerce.matessa.models.*;
import com.ecommerce.matessa.models.PaymentMode;
import com.ecommerce.matessa.models.PaymentStatus;
import com.ecommerce.matessa.payLoad.AddressDTO;
import com.ecommerce.matessa.payLoad.OrderDTO;
import com.ecommerce.matessa.payLoad.OrderItemDTO;
import com.ecommerce.matessa.payLoad.OrderRequestDTO;
import com.ecommerce.matessa.repositories.*;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        if (email != null) cart = cartRepository.findCartByEmail(email);
        if (cart == null && sessionId != null) cart = cartRepository.findBySessionId(sessionId);

        if (cart == null) throw new ResourceExceptionHandler("Cart", "email/session", email);
        if (cart.getCartItems().isEmpty()) throw new ApisExceptionHandler("Cart is empty");

        // --- 2. HANDLE ADDRESS ---
        Address address = getShippingAddress(orderRequest, email);

        // --- 3. CREATE ORDER ---
        Order order = new Order();
        order.setEmail(email);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setAddress(address);

        // ✅ CHANGE: Only set user if the cart has a user (Logged In)
        // If guest (cart.getUser() == null), order.setUser is null.
        if (cart.getUser() != null) {
            order.setUser(cart.getUser());
        }

        // Save order first to generate ID
        Order savedOrder = orderRepository.save(order);

        // --- 4. HANDLE PAYMENT LOGIC (COD vs ONLINE) ---
        //
        Payment payment = new Payment();

        // Convert String from DTO to Enum
        PaymentMode mode;
        try {
            mode = PaymentMode.valueOf(orderRequest.getPaymentMode().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApisExceptionHandler("Invalid Payment Mode. Use 'COD' or 'ONLINE'");
        }

        payment.setPaymentMode(mode);
        payment.setOrder(savedOrder); // Link to Order

        if (mode == PaymentMode.COD) {
            // --- SCENARIO A: Cash On Delivery ---
            payment.setPgName("Cash");
            payment.setPgPaymentId(null); // No ID generated yet
            payment.setPgStatus(PaymentStatus.PENDING);
            payment.setPgResponseMessage("Pending Cash Collection");

            savedOrder.setOrderStatus("Order Placed (COD)"); // Specific Status
        } else {
            // --- SCENARIO B: Online Payment ---
            if (orderRequest.getPgPaymentId() == null || orderRequest.getPgPaymentId().isEmpty()) {
                throw new ApisExceptionHandler("Payment ID is missing for Online Transaction");
            }
            payment.setPgName(orderRequest.getPgName());
            payment.setPgPaymentId(orderRequest.getPgPaymentId());
            payment.setPgStatus(PaymentStatus.SUCCESS); // Assuming frontend sent success
            payment.setPgResponseMessage(orderRequest.getPgResponseMessage());

            savedOrder.setOrderStatus("Order Confirmed"); // Confirmed immediately
        }

        // Save Payment
        payment = paymentRepository.save(payment);

        // Update Order with Payment details
        savedOrder.setPayment(payment);
        savedOrder = orderRepository.save(savedOrder);

        // --- 5. CREATE ORDER ITEMS ---
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);

        // --- 6. UPDATE STOCK ---
        cart.getCartItems().forEach(item -> {
            int quantity = item.getQuantity();
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);
        });

        // --- 7. CLEANUP CART (Safe Unlink Method) ---
        List<CartItem> itemsToDelete = new ArrayList<>(cart.getCartItems());
        cart.getCartItems().clear();
        for (CartItem item : itemsToDelete) {
            item.setCart(null);
        }
        cartItemRepository.deleteAll(itemsToDelete);

        if (cart.getUser() != null) {
            User user = cart.getUser();
            user.setCart(null);
            userRepository.save(user);
        } else {
            cartRepository.delete(cart);
        }

        // --- 8. RESPONSE ---
        OrderDTO orderDTO = modelMapper.map(savedOrder, OrderDTO.class);
        orderItems.forEach(item -> orderDTO.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));
        orderDTO.setAddress(modelMapper.map(address, AddressDTO.class));

        return orderDTO;
    }

    private Address getShippingAddress(OrderRequestDTO orderRequest, String email) {
        AddressDTO dto = orderRequest.getShippingAddress();

        if (dto == null) {
            throw new ApisExceptionHandler("Shipping Address is required!");
        }

        Address address = new Address();
        address.setAddressLine1(dto.getAddressLine1());
        address.setAddressLine2(dto.getAddressLine2());
        address.setStreet(dto.getStreet());
        address.setBuildingName(dto.getBuildingName());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPincode(dto.getPincode());
        address.setPhoneNumber(dto.getPhoneNumber());

        if (email != null) {
            userRepository.findByEmail(email).ifPresent(address::setUser);
        }

        try {
            return addressRepository.save(address);
        } catch (Exception e) {
            System.out.println("❌ ERROR SAVING ADDRESS: " + e.getMessage());
            throw new ApisExceptionHandler("Error saving address: " + e.getMessage());
        }
    }

    @Override
    public OrderDTO getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceExceptionHandler("Order", "orderId", orderId));

        OrderDTO orderDTO = modelMapper.map(order, OrderDTO.class);
        if (order.getAddress() != null) {
            orderDTO.setAddress(modelMapper.map(order.getAddress(), AddressDTO.class));
        }
        return orderDTO;
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(order -> {
                    OrderDTO dto = modelMapper.map(order, OrderDTO.class);
                    dto.setAddress(modelMapper.map(order.getAddress(), AddressDTO.class));
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
}
