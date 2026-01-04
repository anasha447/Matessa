import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowUp } from "lucide-react";

// --- IMPORT ACTIONS FROM YOUR SLICES ---
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import { fetchAllOrders } from "../../redux/slices/orderSlice";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import { fetchAllUsers } from "../../redux/slices/userSlice";

// --- COLORS (Matessa Theme) ---
const COLORS = {
  green: "#3E5F2D",
  yellow: "#F6C90E",
  orange: "#E85D04",
  red: "#dc2626",
  blue: "#1890ff",
  purple: "#722ed1",
  cyan: "#13c2c2",
  grey: "#595959",
};

// ==========================================
// UI COMPONENTS (Antd Style)
// ==========================================

const TopCard = ({ title, prefix, tagContent, tagColor }) => {
  const getTagStyle = (color) => {
    const map = {
      green: { bg: "#f6ffed", text: "#52c41a", border: "#b7eb8f" },
      cyan: { bg: "#e6fffb", text: "#13c2c2", border: "#87e8de" },
      purple: { bg: "#f9f0ff", text: "#722ed1", border: "#d3adf7" },
      red: { bg: "#fff1f0", text: "#ff4d4f", border: "#ffa39e" },
      blue: { bg: "#e6f7ff", text: "#1890ff", border: "#91d5ff" },
    };
    return map[color] || map.green;
  };

  const style = getTagStyle(tagColor);

  return (
    <div className="bg-white rounded-sm shadow-md border border-gray-100 h-[106px] flex flex-col">
      <div className="h-[40px] flex items-center justify-center">
        <h3 className="text-[#22075e] font-bold text-sm m-0">{title}</h3>
      </div>
      <div className="h-[1px] bg-gray-200 w-full"></div>
      <div className="flex-1 flex items-center px-4">
        <div className="w-[45%] text-xs text-gray-500 text-left">{prefix}</div>
        <div className="w-[1px] h-[20px] bg-gray-200 mx-2"></div>
        <div className="w-[45%] flex justify-center">
          <span
            className="text-xs px-2 py-0.5 rounded border"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
            }}
          >
            {tagContent}
          </span>
        </div>
      </div>
    </div>
  );
};

const PreviewState = ({ label, value, color, total }) => {
  // Safe calculation to avoid NaN
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-[#595959] mb-1">
        <span>{label}</span>
        <span>{percentage}% ({value})</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

const RecentTable = ({ title, headers, children }) => (
  <div className="bg-white rounded-sm shadow-md border border-gray-100 overflow-hidden h-full flex flex-col">
    <div className="p-4 border-b border-gray-100 shrink-0">
      <h3 className="text-[#22075e] font-bold text-sm">{title}</h3>
    </div>
    <div className="overflow-x-auto grow">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  </div>
);

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

const Dashboard = () => {
  const dispatch = useDispatch();

  // 1. Select Data from Multiple Slices
  const { stats, loading: statsLoading } = useSelector((state) => state.admin);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  // 2. Fetch All Data on Mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllOrders());
    dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 5 })); // Fetch just a few for the table
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // 3. Compute Derived Data (Memoized)
  const dashboardData = useMemo(() => {
    // --- Order Calculations ---
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "Cancelled").length;
    
    // Check payment status (assuming 'paymentStatus' exists or inferred from orderStatus)
    const paidOrders = orders.filter((o) => o.paymentStatus === "COMPLETED" || o.orderStatus !== "Pending").length;
    const unpaidOrders = totalOrders - paidOrders;

    // --- Product Calculations ---
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => (p.quantity || 0) < 10).length;
    const inStockProducts = totalProducts - lowStockProducts;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      paidOrders,
      unpaidOrders,
      totalProducts,
      inStockProducts,
      lowStockProducts,
    };
  }, [orders, products]);

  // Determine global loading state
  const isLoading = statsLoading || ordersLoading || productsLoading || usersLoading;

  if (isLoading && !stats) {
    return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-body">
      {/* --- ROW 1: TOP CARDS (Using adminSlice stats mostly) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TopCard
          title="Revenue"
          prefix="Total Revenue"
          tagColor="cyan"
          tagContent={`$${(stats?.totalSales || 0).toLocaleString()}`}
        />
        <TopCard
          title="Orders"
          prefix="Total Orders"
          tagColor="purple"
          tagContent={dashboardData.totalOrders || stats?.totalOrders || 0}
        />
        <TopCard
          title="Customers"
          prefix="Registered Users"
          tagColor="green"
          tagContent={users.length || stats?.totalUsers || 0}
        />
        <TopCard
          title="Avg. Value"
          prefix="Per Order"
          tagColor="blue"
          tagContent={`$${
            stats?.totalOrders > 0
              ? (stats.totalSales / stats.totalOrders).toFixed(0)
              : 0
          }`}
        />
      </div>

      {/* --- ROW 2: PREVIEWS & CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* STATUS PREVIEWS (Using Computed Data from Slices) */}
        <div className="lg:col-span-3 bg-white rounded-sm shadow-md border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Order Status */}
            <div>
              <h3 className="text-[#22075e] font-bold text-sm mb-4">
                Order Status
              </h3>
              <PreviewState
                label="Delivered"
                value={dashboardData.deliveredOrders}
                total={dashboardData.totalOrders}
                color={COLORS.green}
              />
              <PreviewState
                label="Pending"
                value={dashboardData.pendingOrders}
                total={dashboardData.totalOrders}
                color={COLORS.orange}
              />
              <PreviewState
                label="Cancelled"
                value={dashboardData.cancelledOrders}
                total={dashboardData.totalOrders}
                color={COLORS.red}
              />
            </div>

            {/* 2. Payment Status */}
            <div>
              <h3 className="text-[#22075e] font-bold text-sm mb-4">
                Payment Status
              </h3>
              <PreviewState
                label="Paid"
                value={dashboardData.paidOrders}
                total={dashboardData.totalOrders}
                color={COLORS.blue}
              />
              <PreviewState
                label="Unpaid/Pending"
                value={dashboardData.unpaidOrders}
                total={dashboardData.totalOrders}
                color={COLORS.grey}
              />
            </div>

            {/* 3. Inventory Health */}
            <div>
              <h3 className="text-[#22075e] font-bold text-sm mb-4">
                Inventory Health
              </h3>
              <PreviewState
                label="In Stock"
                value={dashboardData.inStockProducts}
                total={dashboardData.totalProducts}
                color={COLORS.cyan}
              />
              <PreviewState
                label="Low Stock"
                value={dashboardData.lowStockProducts}
                total={dashboardData.totalProducts}
                color={COLORS.red}
              />
            </div>
          </div>
        </div>

        {/* CUSTOMER CIRCLE (From User Slice) */}
        <div className="lg:col-span-1 bg-white rounded-sm shadow-md border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-[#22075e] font-bold text-sm mb-6">
            Customer Base
          </h3>
          <div className="h-[150px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: users.length || 100 }, { value: 0 }]}
                  innerRadius={45}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS.green} />
                  <Cell fill="#f0f0f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-gray-700">
                {users.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total Registered Users</p>
          <div className="w-full h-[1px] bg-gray-200 my-4"></div>
          <div className="text-center">
            <p className="text-gray-400 text-xs uppercase font-bold">Growth</p>
            <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-lg">
              <ArrowUp size={16} />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- ROW 3: RECENT TABLES (Using Orders and Products Slices) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        
        {/* RECENT ORDERS TABLE */}
       {/* RECENT ORDERS TABLE */}
<RecentTable title="Recent Orders" headers={["Order ID", "Date", "Amt", "Status"]}>
  {orders.slice(0, 5).map((order) => (
    <tr key={order.orderId} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-600">
        {/* ✅ FIXED LINE BELOW */}
        #{String(order.orderId || "").substring(0, 6)}
      </td>
      <td className="px-4 py-3 text-gray-500">
        {new Date(order.orderDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 font-semibold text-gray-700">
        ${order.totalAmount}
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-0.5 rounded border ${
            order.orderStatus === "Delivered"
              ? "bg-green-50 text-green-600 border-green-200"
              : order.orderStatus === "Cancelled"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-orange-50 text-orange-500 border-orange-200"
          }`}
        >
          {order.orderStatus.toUpperCase()}
        </span>
      </td>
    </tr>
  ))}
  {orders.length === 0 && (
    <tr>
      <td colSpan="4" className="p-4 text-center text-gray-400">
        No recent orders
      </td>
    </tr>
  )}
</RecentTable>

        {/* TOP PRODUCTS TABLE */}
        <RecentTable title="Product Inventory" headers={["Product", "Price", "Stock"]}>
          {products.slice(0, 5).map((product) => (
            <tr key={product.productId} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700 font-medium">
                {product.productName}
              </td>
              <td className="px-4 py-3 text-gray-500">
                ${product.specialPrice || product.price}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${
                    (product.quantity || 0) > 10
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {(product.quantity || 0) > 10 ? "High" : "Low"}
                </span>
              </td>
            </tr>
          ))}
           {products.length === 0 && (
            <tr><td colSpan="3" className="p-4 text-center text-gray-400">No products found</td></tr>
          )}
        </RecentTable>
      </div>
    </div>
  );
};

export default Dashboard;