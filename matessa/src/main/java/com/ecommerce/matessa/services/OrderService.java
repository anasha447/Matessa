package com.ecommerce.matessa.services;

import com.ecommerce.matessa.payLoad.OrderDTO;
import com.ecommerce.matessa.payLoad.OrderRequestDTO;
import jakarta.transaction.Transactional;

import java.util.List;

public interface OrderService {
    OrderDTO placeOrder(String email, String sessionId, OrderRequestDTO orderRequest);

    OrderDTO getOrder(Long orderId);

    List<OrderDTO> getAllOrders();

    List<OrderDTO> getOrdersByEmail(String email);

    OrderDTO updateOrderUser(Long orderId, String status);
}