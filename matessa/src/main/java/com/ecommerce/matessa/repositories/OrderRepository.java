package com.ecommerce.matessa.repositories;

import com.ecommerce.matessa.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ✅ NEW: Find orders by Email (For Guest Tracking)
    List<Order> findByEmail(String email);

    // ✅ NEW: Find by Email AND OrderId (For Secure Guest Tracking)
    Order findByEmailAndOrderId(String email, Long orderId);
    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double sumTotalSales();

    // 2. For the Chart: Group sales by date (Simplified for JPA)
    // Note: Depending on your DB (MySQL/H2/Postgres), date formatting syntax varies.
    // This is a generic JPQL approach assuming orderDate is a LocalDate or Date.
    @Query("SELECT o.orderDate, SUM(o.totalAmount) FROM Order o GROUP BY o.orderDate ORDER BY o.orderDate ASC")
    List<Object[]> findSalesGroupedByDate();

}