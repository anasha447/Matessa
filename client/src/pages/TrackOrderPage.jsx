import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackOrder, clearTracking } from "../redux/slices/orderSlice";
import { Link } from "react-router-dom";
import { Search, ArrowRight, AlertCircle, Calendar, CreditCard, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "../components/Spinner"; 

// ✅ 1. DEFINE IMAGE BASE URL
const IMG_BASE_URL = "https://matessa.in";

const TrackOrderPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  
  // Get data from Redux
  const { trackingResult, loading, error } = useSelector((state) => state.orders);

  // Clear previous results when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearTracking());
    };
  }, [dispatch]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(trackOrder(email));
  };

  // ✅ 2. HELPER FUNCTION FOR IMAGES (Adds the Thumbnail feature)
  const getProductImage = (imageName) => {
    if (!imageName) return "/assets/placeholder.png";
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`;
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "SHIPPED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-darkgreen)] mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter the email address used during checkout to see your order status.
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="e.g. guest@example.com"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-green)] focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 bg-[var(--color-darkgreen)] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-70"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-4">
          
          {/* 1. Loading State */}
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {/* 2. Error / No Orders Found State */}
          {!loading && error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl p-6 text-center"
            >
              <div className="inline-flex bg-red-100 p-3 rounded-full text-red-500 mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-1">No Orders Found</h3>
              <p className="text-red-600 text-sm">
                We couldn't find any orders associated with <strong>{email}</strong>.
              </p>
            </motion.div>
          )}

          {/* 3. Success State (List of Orders) */}
          {!loading && trackingResult && trackingResult.orderDetails?.length > 0 && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-bold text-gray-700">
                        Found {trackingResult.totalOrdersFound} Order(s)
                    </h3>
                </div>

                {trackingResult.orderDetails.map((order, index) => {
                  // ✅ Get First Image for Preview
                  const firstItem = order.orderItems?.[0];
                  const previewImage = firstItem?.product?.images?.[0] || firstItem?.product?.image;

                  return (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        
                        {/* ✅ THUMBNAIL IMAGE (Added Feature) */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                            {previewImage ? (
                                <img 
                                    src={getProductImage(previewImage)} 
                                    alt="Order Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = "/assets/placeholder.png"}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={24} />
                                </div>
                            )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-lg font-bold text-gray-800">#{order.orderCode || order.orderId}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <CreditCard size={14} />
                                    {order.payment?.paymentMode || "COD"}
                                </div>
                            </div>
                        </div>

                        {/* Amount & Action */}
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 md:pt-0 pt-4 border-t md:border-t-0">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="text-xl font-bold text-[var(--color-orange)]">
                                    ₹{order.totalAmount.toFixed(2)}
                                </p>
                            </div>
                            
                            <Link 
                                to={`/order-confirmation/${order.orderId}`}
                                className="flex items-center gap-2 text-[var(--color-darkgreen)] font-semibold hover:underline"
                            >
                                View Details <ArrowRight size={16} />
                            </Link>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
};

export default TrackOrderPage;