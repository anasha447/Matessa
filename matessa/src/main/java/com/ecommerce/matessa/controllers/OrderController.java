package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.exceptionHandler.ApisExceptionHandler;
import com.ecommerce.matessa.payLoad.OrderDTO;
import com.ecommerce.matessa.payLoad.OrderRequestDTO;
import com.ecommerce.matessa.payLoad.OrderTrackResponse;
import com.ecommerce.matessa.services.OrderService;
import com.ecommerce.matessa.util.AuthUtil;
import com.ecommerce.matessa.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private AuthUtil authUtil;
    @Autowired
    private CookieUtil cookieUtil;

    // 1. PLACE ORDER
    @PostMapping("/public/order/users/payments/{paymentMode}")
    public ResponseEntity<OrderDTO> orderProducts(@PathVariable String paymentMode,
                                                  @RequestBody OrderRequestDTO orderRequestDTO,
                                                  HttpServletRequest request,
                                                  HttpServletResponse response) {
        String sessionId = cookieUtil.getGuestSessionId(request);
        String emailId = null;
        try {
            emailId = authUtil.loggedInEmail();
        } catch (Exception e) {
            emailId = orderRequestDTO.getEmail();
        }

        if (emailId == null || emailId.trim().isEmpty()) {
            throw new ApisExceptionHandler("Email is required.");
        }

        orderRequestDTO.setPaymentMode(paymentMode);
        OrderDTO order = orderService.placeOrder(emailId, sessionId, orderRequestDTO);
        cookieUtil.deleteGuestCookie(response);

        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    // 2. GET SINGLE ORDER (Public/Shared)
    @GetMapping("/public/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrder(orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    // 3. GET MY ORDERS (Logged In User)
    @GetMapping("/users/orders")
    public ResponseEntity<List<OrderDTO>> getUsersOrders() {
        String email = authUtil.loggedInEmail();
        if (email == null || email.isEmpty()) {
            throw new ApisExceptionHandler("User must be logged in.");
        }
        List<OrderDTO> orders = orderService.getOrdersByEmail(email);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // 4. GET ALL ORDERS (Admin)
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // 5. UPDATE STATUS (Admin)
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        if(status == null) throw new ApisExceptionHandler("Status is required");
        OrderDTO orderDTO = orderService.updateOrderUser(orderId, status);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    // 6. TRACK ORDER (Guest)
    @GetMapping("/public/orders/track")
    public ResponseEntity<OrderTrackResponse> trackOrdersByEmail(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) throw new ApisExceptionHandler("Email required.");

        List<OrderDTO> orders = orderService.getOrdersByEmail(email);
        OrderTrackResponse response = new OrderTrackResponse();
        response.setStatus("Success");
        response.setCustomerEmail(email);
        response.setTotalOrdersFound(orders.size());
        response.setMessage(orders.isEmpty() ? "No orders found." : "Orders found.");
        response.setOrderDetails(orders);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}