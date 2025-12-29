import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { CheckCircle, MapPin, Package, CreditCard, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "../components/Spinner"; // Assuming you have this

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  // Get order details from Redux
  const { currentOrder, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  
  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't retrieve the details for Order #{orderId}.</p>
        <Link to="/" className="text-blue-600 underline">Return Home</Link>
      </div>
    );
  }

  if (!currentOrder) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Success Header */}
        <div className="bg-[var(--color-darkgreen)] text-white p-8 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white text-green-600 rounded-full mb-4 shadow-lg"
          >
            <CheckCircle size={32} strokeWidth={3} />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-green-100 text-lg">Thank you for shopping with Matessa.</p>
        </div>

        <div className="p-8">
          {/* Order ID & Status */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Order Number</p>
              <p className="text-2xl font-mono font-bold text-gray-800">#{currentOrder.orderId}</p>
            </div>
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200 font-medium text-sm flex items-center gap-2">
              <Package size={16} />
              {currentOrder.orderStatus || "Placed"}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Shipping Info */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                <MapPin size={20} className="text-[var(--color-orange)]" />
                <h3>Shipping Location</h3>
              </div>
              <div className="text-gray-600 space-y-1 text-sm">
                <p className="font-medium text-gray-900">{currentOrder.address?.addressLine1}</p>
                {currentOrder.address?.addressLine2 && <p>{currentOrder.address.addressLine2}</p>}
                <p>{currentOrder.address?.city}, {currentOrder.address?.state} - {currentOrder.address?.pincode}</p>
                <p>{currentOrder.address?.country}</p>
                <p className="mt-2 text-xs text-gray-500 font-mono">Phone: {currentOrder.address?.phoneNumber}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                <CreditCard size={20} className="text-[var(--color-orange)]" />
                <h3>Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{currentOrder.payment?.paymentMode || "COD"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${currentOrder.payment?.pgStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
                    {currentOrder.payment?.pgStatus?.toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                  <span className="text-gray-900 font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-[var(--color-orange)]">
                    ₹{currentOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-[var(--color-darkgreen)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmationPage;