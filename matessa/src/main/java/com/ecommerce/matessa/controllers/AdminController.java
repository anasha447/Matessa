package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.payLoad.DashboardStatsDTO;
import com.ecommerce.matessa.repositories.OrderRepository;
import com.ecommerce.matessa.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
// ✅ Secure this entire controller so only Admins can access
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        // 1. Fetch KPI Data
        Double totalSales = orderRepository.sumTotalSales();
        Long totalOrders = orderRepository.count();
        Long totalUsers = userRepository.count();

        // Handle null if no sales yet
        if (totalSales == null) totalSales = 0.0;

        // 2. Fetch Chart Data (Sales over time)
        List<Object[]> salesDataRaw = orderRepository.findSalesGroupedByDate();
        List<DashboardStatsDTO.SalesDataPoint> chartData = new ArrayList<>();

        for (Object[] row : salesDataRaw) {
            // Convert DB result to DTO
            String date = row[0].toString(); // e.g., 2023-10-25
            Double sales = (Double) row[1];
            chartData.add(new DashboardStatsDTO.SalesDataPoint(date, sales));
        }

        // 3. Return Response
        return ResponseEntity.ok(new DashboardStatsDTO(
                totalSales,
                totalOrders,
                totalUsers,
                chartData
        ));
    }
}