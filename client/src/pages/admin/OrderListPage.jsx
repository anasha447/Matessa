import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaSearch, FaEdit, FaBoxOpen, FaCheckCircle, FaTruck, FaTimesCircle, FaClipboardList } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/orderSlice"; 
import Spinner from "../../components/Spinner"; 

// --- 1. STATUS BADGE COMPONENT ---
const StatusBadge = ({ status }) => {
  const styles = {
    PLACED: "bg-purple-100 text-purple-700 border-purple-200",
    CONFIRMED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SHIPPED: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  
  // Normalize status to uppercase to match keys safely
  const safeStatus = status ? status.toUpperCase() : "PLACED";
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[safeStatus] || "bg-gray-100 text-gray-600"}`}>
      {safeStatus}
    </span>
  );
};

// --- 2. UPDATE MODAL COMPONENT ---
const UpdateStatusModal = ({ isOpen, onClose, currentOrder, onUpdate, loading }) => {
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (currentOrder) setSelectedStatus(currentOrder.orderStatus);
  }, [currentOrder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Update Order #{currentOrder?.orderId}
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Select New Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
          >
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onUpdate(currentOrder.orderId, selectedStatus)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
const OrderManagementPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [localUpdateLoading, setLocalUpdateLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Handle Opening Modal
  const openEditModal = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  // Handle Actual Update Logic
  const handleUpdateStatus = async (orderId, newStatus) => {
    setLocalUpdateLoading(true);
    try {
      // 1. Force Uppercase to avoid backend Enum errors
      const safeStatus = newStatus.toUpperCase();
      console.log(`Sending Update: ID=${orderId}, Status=${safeStatus}`);

      // 2. Dispatch Action
      await dispatch(updateOrderStatus({ orderId, status: safeStatus })).unwrap();
      
      // 3. Close Modal & Refresh
      setIsModalOpen(false);
      dispatch(fetchAllOrders()); // Fetch fresh data to be 100% sure
      
      // Optional: Show success toast here
    } catch (err) {
      console.error("Update Failed:", err);
      alert(`Failed: ${err}`);
    } finally {
      setLocalUpdateLoading(false);
    }
  };

  // Filter Logic
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = 
      order.orderId.toString().includes(searchTerm) || 
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "ALL" || 
      (order.orderStatus && order.orderStatus.toUpperCase() === activeTab);

    return matchesSearch && matchesTab;
  });

  // Tab Definitions
  const tabs = [
    { id: "ALL", label: "All Orders", icon: <FaClipboardList /> },
    { id: "PLACED", label: "Placed", icon: <FaBoxOpen /> },
    { id: "SHIPPED", label: "Shipped", icon: <FaTruck /> },
    { id: "DELIVERED", label: "Delivered", icon: <FaCheckCircle /> },
    { id: "CANCELLED", label: "Cancelled", icon: <FaTimesCircle /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Manage and track all customer orders in one place.</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID or Email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Spinner />
            <p className="text-gray-500 mt-4 animate-pulse">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
            Error: {error}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* ✅ UPDATED HEADERS: Added "Items Ordered" */}
                    {["Order ID", "Items Ordered", "Customer", "Date", "Total", "Payment", "Status", "Actions"].map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-blue-50 transition-colors group">
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          #{order.orderId}
                        </td>

                        {/* ✅ NEW COLUMN: Items Ordered */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {order.orderItems && order.orderItems.length > 0 ? (
                              order.orderItems.map((item, idx) => (
                                <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-mono border border-gray-200">
                                    x{item.quantity}
                                  </span>
                                  <span className="font-medium truncate max-w-[150px]" title={item.product?.productName}>
                                    {item.product?.productName || item.productName || "Product"}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm italic">No items</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.email}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border">
                            {order.payment?.paymentMode || "COD"}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.orderStatus} />
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                          {/* View Button */}
                          <Link 
                            to={`/order/${order.orderId}`} 
                            className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-all"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </Link>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(order)}
                            className="text-gray-400 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition-all"
                            title="Update Status"
                          >
                            <FaEdit size={18} />
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center flex flex-col items-center justify-center text-gray-500">
                        <FaBoxOpen className="text-4xl text-gray-300 mb-2" />
                        No orders found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Modal */}
        <UpdateStatusModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentOrder={editingOrder}
          onUpdate={handleUpdateStatus}
          loading={localUpdateLoading}
        />
        
      </div>
    </div>
  );
};

export default OrderManagementPage;