import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaArrowLeft, FaBox, FaUser, FaMapMarkerAlt, FaCreditCard, 
  FaCalendarAlt, FaEnvelope, FaPhone 
} from "react-icons/fa";
import { fetchOrderDetails } from "../../redux/slices/orderSlice";
import Spinner from "../../components/Spinner";

// 1. DEFINE IMAGE BASE URL
const IMG_BASE_URL = "https://matessa.in";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    PLACED: "bg-purple-100 text-purple-700 border-purple-200",
    CONFIRMED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    SHIPPED: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  const safeStatus = status ? status.toUpperCase() : "PLACED";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[safeStatus]}`}>
      {safeStatus}
    </span>
  );
};

const SingleOrderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.orders);

  // Fetch Logic
  useEffect(() => {
    // We compare strings to ensure type safety (URL param is string, ID is usually number)
    if (!currentOrder || currentOrder.orderId?.toString() !== id) {
       dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id, currentOrder]);

  // 2. HELPER FUNCTION FOR IMAGES
  const getProductImage = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/150"; // Admin placeholder
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`; // Use /api/public/images/ if needed
  };

  // ✅ 3. HELPER: Format Exact Time
  const formatFullTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // Exact seconds
      hour12: true,
    });
  };

  if (loading) return <Spinner />;
  
  if (error || !currentOrder) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-4">{error || "We couldn't locate this order."}</p>
        <Link to="/admin/orders" className="text-blue-600 hover:underline">Back to Dashboard</Link>
    </div>
  );

  const order = currentOrder;
  
  // Handle address mapping (JSON returns 'address', not 'shippingAddress')
  const address = order.address || order.shippingAddress || {};

  // ✅ FIX 4: Filter Ghost Items
  const validItems = (order.orderItems || []).filter(item => 
      item.product && item.product.productName
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
             <Link to="/admin/orders" className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-2 mb-2 transition-colors">
                <FaArrowLeft /> Back to Orders
             </Link>
             <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                Order #{order.orderCode || order.orderId} 
                <StatusBadge status={order.orderStatus} />
             </h1>
             {/* ✅ UPDATED: Shows Exact Time */}
             <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 font-mono">
                <FaCalendarAlt /> Placed on {formatFullTime(order.orderDate)}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ITEMS */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2">
                     <FaBox className="text-blue-500" /> Order Items
                   </h2>
                   <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600">
                      {validItems.length} Items
                   </span>
                </div>
                <div className="p-6 space-y-6">
                   {validItems.length === 0 ? (
                       <div className="text-center text-gray-400 italic">No valid items found.</div>
                   ) : (
                       validItems.map((item, index) => {
                          // Handle Images Array
                          const prodImage = item.product?.images?.[0] || item.product?.image;
                          
                          return (
                            <div key={index} className="flex gap-4 items-center">
                               <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                  <img 
                                    src={getProductImage(prodImage)}
                                    alt={item.product?.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                                  />
                               </div>
                               <div className="flex-1">
                                  <h4 className="font-bold text-gray-800">{item.product?.productName}</h4>
                                  <p className="text-xs text-gray-500">Unit Price: ₹{item.orderedProductPrice?.toFixed(2)}</p>
                               </div>
                               <div className="text-right">
                                  <p className="font-bold text-gray-800">₹{(item.orderedProductPrice * item.quantity).toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                               </div>
                            </div>
                          );
                       })
                   )}
                </div>
             </div>

             {/* Payment */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2">
                     <FaCreditCard className="text-green-500" /> Payment Details
                   </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Method</p>
                      <p className="font-bold text-gray-800 mt-1">{order.payment?.paymentMode || "COD"}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                         order.payment?.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                         {order.payment?.paymentStatus || "PENDING"}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2"><FaUser className="text-orange-500" /> Details</h2>
                </div>
                <div className="p-6 space-y-4">
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                      {/* Use Order Email */}
                      <p className="text-sm font-medium text-gray-800 break-all">
                          <FaEnvelope className="inline mr-2 text-gray-400"/>
                          {order.email || "N/A"}
                      </p>
                   </div>
                   <hr className="border-gray-100" />
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1"><FaMapMarkerAlt className="inline mr-1"/> Shipping To</p>
                      <div className="text-sm text-gray-600 leading-relaxed">
                          <p className="font-bold text-gray-800">{address.addressLine1 || "No Street Info"}</p>
                          <p>{address.city || ""}{address.state ? `, ${address.state}` : ""}</p>
                          <p>{address.country || "India"} - {address.pincode || ""}</p>
                          {address.phoneNumber && <p className="mt-1 text-gray-500 text-xs"><FaPhone className="inline mr-1"/>{address.phoneNumber}</p>}
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800">Total Summary</h2>
                </div>
                <div className="p-6 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">Grand Total</span>
                      <span className="text-xl font-extrabold text-[var(--color-darkgreen)]">
                         ₹{order.totalAmount.toFixed(2)}
                      </span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SingleOrderPage;