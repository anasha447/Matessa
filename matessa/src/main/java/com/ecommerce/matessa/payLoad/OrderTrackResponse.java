package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackResponse {

    private String status;          // e.g., "Success"
    private String message;         // e.g., "Found 2 orders for this email"
    private String customerEmail;   // The email that was searched
    private int totalOrdersFound;   // Count of orders
    private List<OrderDTO> orderDetails; // The actual list of orders
}