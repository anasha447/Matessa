package com.ecommerce.matessa.payLoad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Comprehensive dashboard statistics DTO.
 *
 * <p>Returned by GET /api/admin/stats — all fields are read-only from the
 * frontend perspective. The inner DTOs match the Recharts data-key convention
 * used in the Dashboard component.</p>
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {

    // ── KPI Cards ────────────────────────────────────────────────────────────
    /** Sum of all order totals (INR). */
    private Double totalRevenue;

    /** Total number of orders ever placed. */
    private Long totalOrders;

    /** Total registered users. */
    private Long totalUsers;

    /** Number of products with quantity < 10 (low-stock alert). */
    private Long lowStockProducts;

    /** Number of orders with status = PENDING. */
    private Long pendingOrders;

    /** Number of orders with status = DELIVERED. */
    private Long deliveredOrders;

    // ── Chart Data ───────────────────────────────────────────────────────────

    /**
     * Monthly revenue for the last 12 months.
     * <br>Recharts dataKeys: {@code month}, {@code revenue}
     */
    private List<MonthlyRevenuePoint> monthlyRevenue;

    /**
     * Order-status distribution for the donut/pie chart.
     * <br>Recharts dataKeys: {@code name}, {@code value}
     */
    private List<OrderStatusPoint> orderStatusBreakdown;

    /**
     * Top 5 best-selling products by revenue.
     * <br>Recharts dataKeys: {@code name}, {@code revenue}, {@code units}
     */
    private List<TopProductPoint> topProducts;

    /**
     * Most recent 5 orders for the "Recent Orders" table.
     */
    private List<RecentOrderDTO> recentOrders;

    // ══════════════════════════════════════════════════════════════════════════
    // INNER DTOs
    // ══════════════════════════════════════════════════════════════════════════

    /** One data point in the monthly-revenue area/bar chart. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyRevenuePoint {
        /** e.g. "Jan 2025" */
        private String month;
        private Double revenue;
    }

    /** One slice in the order-status doughnut chart. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderStatusPoint {
        private String name;
        private Long value;
    }

    /** One bar in the top-products chart. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProductPoint {
        private String name;
        private Double revenue;
        private Long units;
    }

    /** Row in the Recent Orders table on the dashboard. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentOrderDTO {
        private Long orderId;
        private String orderCode;
        private String email;
        private Double totalAmount;
        private String orderStatus;
        /** ISO-8601 date string derived from LocalDateTime */
        private String orderDate;
    }
}