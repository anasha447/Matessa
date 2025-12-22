import React, { useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";

const Dashboard = () => {
  const dispatch = useDispatch();

  // 1. Get Data
  const { stats, loading, error } = useSelector((state) => state.admin);

  // 2. Fetch Data on Mount
  useEffect(() => {
    // We don't need to check roles here because AdminRoute protects this page.
    // Just fetch the data.
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-12 px-4 md:px-12 bg-[var(--color-white)]">
      <h1 className="text-4xl font-bold text-center mb-12 text-[var(--color-darkgreen)] font-heading">
        Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-center py-10 text-lg font-bold text-gray-500">Loading stats...</div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg border border-red-200">
          Error: {error}
        </div>
      ) : stats ? (
        <>
          {/* --- KPI Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* Total Sales */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-[var(--color-orange)]">
              <h2 className="text-xl font-bold text-[var(--color-darkgreen)] font-heading">Total Sales</h2>
              <p className="text-4xl font-bold text-[var(--color-green)] mt-2">
                ${(stats.totalSales || 0).toFixed(2)}
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-[var(--color-yellow)]">
              <h2 className="text-xl font-bold text-[var(--color-darkgreen)] font-heading">Total Orders</h2>
              <p className="text-4xl font-bold text-[var(--color-green)] mt-2">
                {stats.totalOrders || 0}
              </p>
            </div>

            {/* Total Users */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-[var(--color-lightgreen)]">
              <h2 className="text-xl font-bold text-[var(--color-darkgreen)] font-heading">Total Users</h2>
              <p className="text-4xl font-bold text-[var(--color-green)] mt-2">
                {stats.totalUsers || 0}
              </p>
            </div>
          </div>

          {/* --- Chart Section --- */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-darkgreen)] font-heading">
              Sales Over Time
            </h2>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={stats.salesData || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* Ensure dataKey matches your backend DTO field name exactly */}
                  <XAxis dataKey="_id" /> 
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#3E5F2D" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">No stats available.</div>
      )}
    </div>
  );
};

export default Dashboard;