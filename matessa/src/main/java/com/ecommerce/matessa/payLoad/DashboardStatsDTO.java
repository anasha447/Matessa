package com.ecommerce.matessa.payLoad;

import lombok.Getter;

import java.util.List;

public class DashboardStatsDTO {
    private final Double totalSales;
    private final Long totalOrders;
    private final Long totalUsers;
    private final List<SalesDataPoint> salesData;

    // Constructors, Getters, Setters
    public DashboardStatsDTO(Double totalSales, Long totalOrders, Long totalUsers, List<SalesDataPoint> salesData) {
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.totalUsers = totalUsers;
        this.salesData = salesData;
    }

    // Inner class for the chart data
    @Getter
    public static class SalesDataPoint {
        // Getters and Setters
        private final String _id; // Matches your Recharts dataKey="_id"
        private final Double totalSales;

        public SalesDataPoint(String date, Double sales) {
            this._id = date;
            this.totalSales = sales;
        }

    }

    // Add Getters for the main class fields here...
    public Double getTotalSales() { return totalSales; }
    public Long getTotalOrders() { return totalOrders; }
    public Long getTotalUsers() { return totalUsers; }
    public List<SalesDataPoint> getSalesData() { return salesData; }
}