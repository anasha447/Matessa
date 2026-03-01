import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  AlertCircle, CheckCircle2, Package, ArrowRight,
  Clock, CreditCard
} from "lucide-react";

// --- IMPORT ACTIONS FROM YOUR SLICES ---
import { fetchDashboardStats } from "../../redux/slices/adminSlice";
import { fetchAllOrders } from "../../redux/slices/orderSlice";
import { fetchAllProducts } from "../../redux/slices/productSlice";
import { fetchAllUsers } from "../../redux/slices/userSlice";

// High-End Palette
const THEME = {
  primary: "#6366f1", // Indigo
  success: "#10b981", // Emerald
  warning: "#f59e0b", // Amber
  danger: "#ef4444",  // Rose
  surface: "#ffffff",
  background: "#f8fafc",
  textMain: "#1e293b",
  textMuted: "#64748b"
};

// ==========================================
// REUSABLE UI COMPONENTS
// ==========================================

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start transition-all hover:shadow-md">
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <div className="flex items-center mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
          <TrendingUp size={12} className="mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const SectionWrapper = ({ title, children, subtitle, action }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
    <div className="mb-6 flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="flex-1 w-full">
      {children}
    </div>
  </div>
);

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================

const Dashboard = () => {
  const dispatch = useDispatch();

  const { stats, loading: statsLoading } = useSelector((state) => state.admin);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllOrders());
    dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 5 }));
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const dashboardData = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
    const lowStockCount = products.filter((p) => (p.quantity || 0) < 10).length;

    // Mock trend data for the area chart based on real counts
    const chartData = [
      { name: 'Mon', val: 2400 },
      { name: 'Tue', val: 1398 },
      { name: 'Wed', val: 9800 },
      { name: 'Thu', val: 3908 },
      { name: 'Fri', val: 4800 },
      { name: 'Sat', val: 3800 },
      { name: 'Sun', val: stats?.totalSales || 4300 },
    ];

    return { totalOrders, pendingOrders, deliveredOrders, lowStockCount, chartData };
  }, [orders, products, stats]);

  const isLoading = statsLoading || ordersLoading || productsLoading || usersLoading;

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* --- HEADER --- */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">Real-time store performance and analytics.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-bold flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* --- ROW 1: TOP STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Revenue" 
          value={`$${(stats?.totalSales || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend="+14% this week"
          colorClass="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          title="Orders" 
          value={dashboardData.totalOrders} 
          icon={ShoppingBag} 
          colorClass="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          title="Customers" 
          value={users.length} 
          icon={Users} 
          trend="Active now"
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Stock Alerts" 
          value={dashboardData.lowStockCount} 
          icon={AlertCircle} 
          colorClass="bg-rose-50 text-rose-600" 
        />
      </div>

      {/* --- ROW 2: CHARTS & PIE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SectionWrapper title="Revenue Analytics" subtitle="Sales performance over the last 7 days">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  />
                  <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionWrapper>
        </div>

        <div className="lg:col-span-1">
          <SectionWrapper title="Order Breakdown" subtitle="Delivery vs Pending distribution">
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Delivered', value: dashboardData.deliveredOrders || 1 },
                      { name: 'Pending', value: dashboardData.pendingOrders || 1 },
                    ]}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    <Cell fill={THEME.success} stroke="none" />
                    <Cell fill={THEME.warning} stroke="none" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{dashboardData.totalOrders}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Delivered</div>
                <span className="text-slate-600">{dashboardData.deliveredOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> Pending</div>
                <span className="text-slate-600">{dashboardData.pendingOrders}</span>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>

      {/* --- ROW 3: TABLES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionWrapper 
          title="Recent Orders" 
          action={<button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest">
                  <th className="pb-2 px-2">ID</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.orderId} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs font-bold text-indigo-600">
                      #{String(order.orderId).substring(0, 6)}
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border ${
                        order.orderStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-700">${order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>

        <SectionWrapper 
          title="Inventory Overview"
          action={<button className="text-indigo-600 text-xs font-bold hover:underline">Manage Stock</button>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest">
                  <th className="pb-2 px-2">Product</th>
                  <th className="pb-2">Health</th>
                  <th className="pb-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product) => (
                  <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-sm font-bold text-slate-700 truncate max-w-[150px]">
                      {product.productName}
                    </td>
                    <td>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${product.quantity > 10 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(product.quantity || 0, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-right font-bold text-slate-700">${product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default Dashboard;