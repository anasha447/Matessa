import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  AlertCircle, Clock, Package, ArrowRight, CheckCircle2
} from "lucide-react";
import { fetchDashboardStats } from "../../redux/slices/adminSlice";

// ─── Colour palette ────────────────────────────────────────────────────────────
const COLORS = {
  primary:   "#6366f1",   // indigo
  success:   "#10b981",   // emerald
  warning:   "#f59e0b",   // amber
  danger:    "#ef4444",   // rose
  purple:    "#8b5cf6",
  cyan:      "#06b6d4",
  slate50:   "#f8fafc",
  slate100:  "#f1f5f9",
  slate400:  "#94a3b8",
  slate800:  "#1e293b",
};

const STATUS_COLORS = {
  DELIVERED:  COLORS.success,
  PENDING:    COLORS.warning,
  CANCELLED:  COLORS.danger,
  PROCESSING: COLORS.primary,
  SHIPPED:    COLORS.cyan,
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: "14px",
    border: "none",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,.12)",
    fontSize: 13,
    fontWeight: 600,
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const StatCard = ({ title, value, icon: Icon, trend, color, gradient }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between"
    style={{ background: gradient || "#fff", border: "1px solid #f1f5f9" }}
  >
    {/* background glow */}
    <div
      className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20"
      style={{ background: color }}
    />
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp size={11} /> {trend}
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl" style={{ background: `${color}18` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </div>
);

const Card = ({ title, subtitle, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
    <div className="flex justify-between items-start px-6 pt-6 pb-4 border-b border-slate-50">
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="flex-1 p-6">{children}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const color = STATUS_COLORS[status] || COLORS.slate400;
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight"
      style={{ background: `${color}18`, color }}
    >
      {status}
    </span>
  );
};

// Custom tooltip for revenue chart
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
        <p className="text-base font-black text-indigo-600">
          ₹{payload[0].value?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Derive chart data from live stats ─────────────────────────────────────────
  const { monthlyData, statusData, topProductsData } = useMemo(() => {
    const monthlyData = stats?.monthlyRevenue?.map((p) => ({
      name: p.month,
      revenue: p.revenue,
    })) ?? [];

    const statusData = stats?.orderStatusBreakdown?.map((p) => ({
      name: p.name,
      value: p.value,
    })) ?? [];

    const topProductsData = stats?.topProducts?.map((p) => ({
      name: p.name?.length > 18 ? p.name.slice(0, 16) + "…" : p.name,
      revenue: p.revenue,
      units: p.units,
    })) ?? [];

    return { monthlyData, statusData, topProductsData };
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Store Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-0.5">
            Real-time analytics &amp; store performance
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 font-bold flex items-center gap-2">
            <Clock size={15} className="text-indigo-500" />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short", month: "long", day: "numeric", year: "numeric",
            })}
          </div>
          <Link
            to="/admin/orders"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <ShoppingBag size={15} /> All Orders
          </Link>
        </div>
      </header>

      {/* ── ROW 1: KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color={COLORS.primary}
        />
        <StatCard
          title="Orders"
          value={(stats?.totalOrders ?? 0).toLocaleString()}
          icon={ShoppingBag}
          color={COLORS.warning}
        />
        <StatCard
          title="Customers"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          icon={Users}
          color={COLORS.success}
        />
        <StatCard
          title="Pending"
          value={(stats?.pendingOrders ?? 0).toLocaleString()}
          icon={Clock}
          color={COLORS.purple}
        />
        <StatCard
          title="Delivered"
          value={(stats?.deliveredOrders ?? 0).toLocaleString()}
          icon={CheckCircle2}
          color={COLORS.cyan}
        />
        <StatCard
          title="Low Stock"
          value={(stats?.lowStockProducts ?? 0).toLocaleString()}
          icon={AlertCircle}
          color={COLORS.danger}
        />
      </div>

      {/* ── ROW 2: AREA CHART + DONUT ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Monthly Revenue Area Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Monthly Revenue"
            subtitle="Last 12 months — actual order totals"
          >
            {monthlyData.length > 0 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.slate100} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fill: COLORS.slate400, fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: COLORS.slate400, fontSize: 11 }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone" dataKey="revenue"
                      stroke={COLORS.primary} strokeWidth={3}
                      fill="url(#revenueGrad)"
                      dot={{ r: 4, fill: COLORS.primary, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 font-medium">
                No revenue data yet
              </div>
            )}
          </Card>
        </div>

        {/* Order Status Donut */}
        <div className="lg:col-span-1">
          <Card title="Order Status" subtitle="Distribution across all statuses">
            {statusData.length > 0 ? (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={STATUS_COLORS[entry.name] || COLORS.slate400}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {statusData.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: STATUS_COLORS[entry.name] || COLORS.slate400 }}
                        />
                        <span className="text-slate-600">{entry.name}</span>
                      </div>
                      <span className="font-black text-slate-800">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 font-medium">
                No order data yet
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── ROW 3: TOP PRODUCTS BAR + RECENT ORDERS ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products Bar Chart */}
        <Card
          title="Top Products"
          subtitle="By revenue — best 5 performers"
          action={
            <Link to="/admin/products" className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
              Manage <ArrowRight size={12} />
            </Link>
          }
        >
          {topProductsData.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.slate100} />
                  <XAxis
                    type="number" axisLine={false} tickLine={false}
                    tick={{ fill: COLORS.slate400, fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category" dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: COLORS.slate800, fontSize: 11, fontWeight: 700 }}
                    width={110}
                  />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(val) => [`₹${val?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                    {topProductsData.map((_, i) => (
                      <Cell key={i} fill={[COLORS.primary, COLORS.purple, COLORS.success, COLORS.cyan, COLORS.warning][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-400 font-medium">
              No sales data yet
            </div>
          )}
        </Card>

        {/* Recent Orders Table */}
        <Card
          title="Recent Orders"
          subtitle="Last 5 orders placed"
          action={
            <Link to="/admin/orders" className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          {stats?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase tracking-widest">
                    <th className="pb-1 px-2">Code</th>
                    <th className="pb-1">Customer</th>
                    <th className="pb-1">Status</th>
                    <th className="pb-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.orderId} className="group hover:bg-slate-50 transition-colors rounded-xl">
                      <td className="py-2.5 px-2 font-mono text-xs font-bold text-indigo-600">
                        <Link to={`/admin/order/${order.orderId}`} className="hover:underline">
                          {order.orderCode || `#${order.orderId}`}
                        </Link>
                      </td>
                      <td className="py-2.5 text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                        {order.email}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-800 text-sm">
                        ₹{order.totalAmount?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Package size={40} className="mb-3 opacity-30" />
              <p className="font-medium">No orders yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;