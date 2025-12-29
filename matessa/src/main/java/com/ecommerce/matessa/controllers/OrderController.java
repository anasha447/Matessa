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

    // NOTE: The URL variable is 'paymentMode' (COD or ONLINE)
    @PostMapping("/public/order/users/payments/{paymentMode}")
    public ResponseEntity<OrderDTO> orderProducts(@PathVariable String paymentMode,
                                                  @RequestBody OrderRequestDTO orderRequestDTO,
                                                  HttpServletRequest request,
                                                  HttpServletResponse response) {

        // 1. Get Session ID
        String sessionId = cookieUtil.getGuestSessionId(request);

        // 2. Get Email
        String emailId = null;
        try {
            emailId = authUtil.loggedInEmail();
        } catch (Exception e) {
            emailId = orderRequestDTO.getEmail();
        }

        if (emailId == null || emailId.trim().isEmpty()) {
            throw new ApisExceptionHandler("Email is required to place an order.");
        }

        // ✅ FIX: Map the Path Variable to the DTO's 'paymentMode' field
        orderRequestDTO.setPaymentMode(paymentMode);

        // 3. Place Order
        OrderDTO order = orderService.placeOrder(emailId, sessionId, orderRequestDTO);

        // 4. Cleanup Guest Cookie
        cookieUtil.deleteGuestCookie(response);

        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/public/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrder(orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        if(status == null) throw new ApisExceptionHandler("Status is required");

        OrderDTO orderDTO = orderService.updateOrderUser(orderId, status); // Ensure your Service has this method!
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }


    @GetMapping("/public/orders/track")
    public ResponseEntity<OrderTrackResponse> trackOrdersByEmail(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ApisExceptionHandler("Email is required for tracking.");
        }

        List<OrderDTO> orders = orderService.getOrdersByEmail(email);

        OrderTrackResponse response = new OrderTrackResponse();
        response.setStatus("Success");
        response.setCustomerEmail(email);
        response.setTotalOrdersFound(orders.size());

        if (orders.isEmpty()) {
            response.setMessage("No orders found for this email.");
        } else {
            response.setMessage("We found " + orders.size() + " past order(s).");
        }

        response.setOrderDetails(orders);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}