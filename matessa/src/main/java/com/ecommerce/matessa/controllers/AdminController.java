package com.ecommerce.matessa.controllers;

import com.ecommerce.matessa.models.Order;
import com.ecommerce.matessa.payLoad.DashboardStatsDTO;
import com.ecommerce.matessa.repositories.OrderRepository;
import com.ecommerce.matessa.repositories.ProductRepository;
import com.ecommerce.matessa.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private static final DateTimeFormatter MONTH_FMT =
            DateTimeFormatter.ofPattern("MMM yyyy");

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/admin/stats
    // ──────────────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {

        // ── 1. KPI scalars ────────────────────────────────────────────────────
        Double totalRevenue = orderRepository.sumTotalSales();
        if (totalRevenue == null) totalRevenue = 0.0;

        Long totalOrders   = orderRepository.count();
        Long totalUsers    = userRepository.count();
        Long lowStock      = productRepository.countByQuantityLessThan(10);
        Long pendingOrders   = orderRepository.countByStatus("PENDING");
        Long deliveredOrders = orderRepository.countByStatus("DELIVERED");

        // ── 2. Monthly revenue (last 12 months) ───────────────────────────────
        List<Object[]> monthlyRaw = orderRepository.findMonthlyRevenue();
        List<DashboardStatsDTO.MonthlyRevenuePoint> monthlyRevenue = new ArrayList<>();

        String[] MONTH_NAMES = { "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        for (Object[] row : monthlyRaw) {
            int year    = ((Number) row[0]).intValue();
            int month   = ((Number) row[1]).intValue();
            Double rev  = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            String label = MONTH_NAMES[month] + " " + year;
            monthlyRevenue.add(new DashboardStatsDTO.MonthlyRevenuePoint(label, rev));
        }

        // ── 3. Order status breakdown ─────────────────────────────────────────
        List<Object[]> statusRaw = orderRepository.findOrderStatusBreakdown();
        List<DashboardStatsDTO.OrderStatusPoint> statusBreakdown = new ArrayList<>();
        for (Object[] row : statusRaw) {
            String status = row[0] != null ? row[0].toString() : "Unknown";
            Long count    = ((Number) row[1]).longValue();
            statusBreakdown.add(new DashboardStatsDTO.OrderStatusPoint(status, count));
        }

        // ── 4. Top products ───────────────────────────────────────────────────
        List<Object[]> topRaw = orderRepository.findTopProductsByRevenue();
        List<DashboardStatsDTO.TopProductPoint> topProducts = new ArrayList<>();
        for (Object[] row : topRaw) {
            String name  = row[0] != null ? row[0].toString() : "Unknown";
            Double rev   = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            Long units   = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            topProducts.add(new DashboardStatsDTO.TopProductPoint(name, rev, units));
        }

        // ── 5. Recent 5 orders ────────────────────────────────────────────────
        List<Order> recentRaw = orderRepository.findRecentOrders();
        List<DashboardStatsDTO.RecentOrderDTO> recentOrders = new ArrayList<>();
        for (Order o : recentRaw) {
            recentOrders.add(new DashboardStatsDTO.RecentOrderDTO(
                    o.getOrderId(),
                    o.getOrderCode(),
                    o.getEmail(),
                    o.getTotalAmount(),
                    o.getOrderStatus() != null ? o.getOrderStatus().name() : "UNKNOWN",
                    o.getOrderDate() != null ? o.getOrderDate().toLocalDate().toString() : ""
            ));
        }

        // ── 6. Assemble & return ──────────────────────────────────────────────
        DashboardStatsDTO dto = new DashboardStatsDTO(
                totalRevenue,
                totalOrders,
                totalUsers,
                lowStock,
                pendingOrders,
                deliveredOrders,
                monthlyRevenue,
                statusBreakdown,
                topProducts,
                recentOrders
        );

        return ResponseEntity.ok(dto);
    }
}