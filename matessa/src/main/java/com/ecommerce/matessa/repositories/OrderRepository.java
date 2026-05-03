package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ── Guest / user tracking ──────────────────────────────────────────────
    List<Order> findByEmail(String email);

    Order findByEmailAndOrderId(String email, Long orderId);

    // ── KPI Queries ────────────────────────────────────────────────────────

    /** Total revenue: sum of all order amounts. */
    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double sumTotalSales();

    /** Count orders by a given status string (e.g. "Pending", "Delivered"). */
    @Query("SELECT COUNT(o) FROM Order o WHERE CAST(o.orderStatus AS string) = :status")
    Long countByStatus(@Param("status") String status);

    // ── Chart Queries ─────────────────────────────────────────────────────

    /**
     * Monthly revenue for the last 12 months.
     * Returns Object[] rows: [year (int), month (int), revenue (Double)]
     *
     * NOTE: Uses YEAR/MONTH functions — works on MySQL & H2.
     * PostgreSQL users: replace with DATE_TRUNC('month', o.orderDate).
     */
    @Query("""
        SELECT YEAR(o.orderDate), MONTH(o.orderDate), SUM(o.totalAmount)
        FROM Order o
        WHERE o.orderDate >= CURRENT_TIMESTAMP - 365 DAY
        GROUP BY YEAR(o.orderDate), MONTH(o.orderDate)
        ORDER BY YEAR(o.orderDate) ASC, MONTH(o.orderDate) ASC
        """)
    List<Object[]> findMonthlyRevenue();

    /**
     * Order-status count breakdown for the doughnut chart.
     * Returns Object[] rows: [statusString, count]
     */
    @Query("SELECT CAST(o.orderStatus AS string), COUNT(o) FROM Order o GROUP BY o.orderStatus")
    List<Object[]> findOrderStatusBreakdown();

    /**
     * Top 5 products by total revenue (sum of orderItem.orderedProductPrice * quantity).
     * Returns Object[] rows: [productName, revenue, unitsSold]
     */
    @Query("""
        SELECT oi.product.productName, SUM(oi.orderedProductPrice * oi.quantity), SUM(oi.quantity)
        FROM OrderItem oi
        WHERE oi.product IS NOT NULL
        GROUP BY oi.product.productName
        ORDER BY SUM(oi.orderedProductPrice * oi.quantity) DESC
        LIMIT 5
        """)
    List<Object[]> findTopProductsByRevenue();

    /**
     * 5 most recent orders for the dashboard table.
     */
    @Query("""
        SELECT o FROM Order o
        ORDER BY o.orderDate DESC
        LIMIT 5
        """)
    List<Order> findRecentOrders();
}