import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaSearch } from "react-icons/fa";
import Spinner from "../../components/Spinner"; 
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../redux/slices/adminSlice"; 

const OrderListPage = () => {
  const dispatch = useDispatch();

  // 1. Get State
  const { orders, loading, error } = useSelector((state) => state.admin);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 2. ✅ FIX: Just fetch data. AdminRoute protects this page.
  useEffect(() => {
      dispatch(fetchAllOrders());
  }, [dispatch]);

  // ... rest of your logic (filtering, rendering) remains the same ...
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === "All" || order.orderStatus === filterStatus;
    const matchesSearch = order.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderId?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Order Management</h1>
          <div className="mt-4 md:mt-0 relative">
            <input 
              type="text" 
              placeholder="Search by ID or Email..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status 
                  ? "bg-[var(--color-darkgreen)] text-white shadow-md" 
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Tracking ID", "Customer", "Date", "Total", "Payment", "Status", "Actions"].map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders && filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 font-medium">#{order.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold mr-3">
                            {order.email ? order.email.charAt(0).toUpperCase() : "G"}
                          </div>
                          {order.email || "Guest User"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/order/${order.orderId}`} className="text-[var(--color-green)] hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-full inline-block transition-colors">
                          <FaEye size={18} />
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderListPage;