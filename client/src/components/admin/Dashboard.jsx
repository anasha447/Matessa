import React, { useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, PieChart, Pie, Cell
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import { FaWallet, FaShoppingBag, FaUsers, FaChartLine } from "react-icons/fa";

// --- COLORS (Matches your theme) ---
const COLORS = {
  primary: "#3E5F2D", // Dark Green
  secondary: "#F6C90E", // Yellow
  accent: "#E85D04", // Orange
  light: "#F0FDF4", // Light Green BG
  text: "#1F2937",
};

const PIE_COLORS = ["#3E5F2D", "#E85D04", "#F6C90E", "#dc2626"];

// --- REUSABLE STAT CARD ---
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1 hover:shadow-md">
    <div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-heading font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-full text-white text-xl shadow-lg`} style={{ backgroundColor: color }}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // --- DATA PROCESSING ---
  // Memoize data to prevent re-renders. 
  // If your backend only sends 'totalSales', we mock 'totalOrders' for the demo if missing.
  const chartData = useMemo(() => {
    if (!stats?.salesData) return [];
    return stats.salesData.map(item => ({
      ...item,
      // Fallback: If backend doesn't send totalOrders in salesData, generate a mock number relative to sales for visualization
      totalOrders: item.totalOrders || Math.round(item.totalSales / 50) 
    }));
  }, [stats]);

  // Mock Data for Pie Chart (Replace with stats.orderStatusData if available)
  const pieData = [
    { name: "Delivered", value: stats?.totalOrders ? Math.round(stats.totalOrders * 0.7) : 0 },
    { name: "Processing", value: stats?.totalOrders ? Math.round(stats.totalOrders * 0.2) : 0 },
    { name: "Cancelled", value: stats?.totalOrders ? Math.round(stats.totalOrders * 0.1) : 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-darkgreen)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => dispatch(fetchDashboardStats())}
            className="bg-[var(--color-darkgreen)] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-darkgreen)] font-heading">
              Overview
            </h1>
            <p className="text-gray-500 mt-1">Here is what's happening with your store today.</p>
          </div>
          <button 
            onClick={() => dispatch(fetchDashboardStats())} 
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Refresh Stats
          </button>
        </div>

        {/* --- 1. KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Revenue" 
            value={`$${(stats?.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            icon={<FaWallet />} 
            color={COLORS.primary} 
          />
          <StatCard 
            title="Total Orders" 
            value={stats?.totalOrders || 0} 
            icon={<FaShoppingBag />} 
            color={COLORS.accent} 
          />
          <StatCard 
            title="Total Customers" 
            value={stats?.totalUsers || 0} 
            icon={<FaUsers />} 
            color={COLORS.secondary} 
          />
          {/* Derived Metric */}
          <StatCard 
            title="Avg. Order Value" 
            value={`$${stats?.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(2) : "0.00"}`} 
            icon={<FaChartLine />} 
            color="#3B82F6" 
          />
        </div>

        {/* --- 2. MAIN CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* LEFT: Revenue Trend (Area Chart) - Takes 2/3 width */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-[var(--color-darkgreen)] rounded-full"></span>
              Revenue Analytics
            </h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalSales" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: Order Status (Pie Chart) - Takes 1/3 width */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 text-center pointer-events-none">
                <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. SECONDARY CHART: Sales vs Orders --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Performance: Sales vs Orders</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="_id" scale="band" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke={COLORS.primary} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke={COLORS.accent} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalSales" name="Revenue ($)" barSize={40} fill={COLORS.primary} radius={[10, 10, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="totalOrders" name="Orders Count" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;