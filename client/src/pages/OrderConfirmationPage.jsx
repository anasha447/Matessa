import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import { 
  FaCheckCircle, FaBox, FaMapMarkerAlt, FaCreditCard, 
  FaCalendarAlt, FaPhone, FaShoppingBag, 
  FaTruck, FaQuestionCircle, FaPrint 
} from "react-icons/fa";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import Spinner from "../components/Spinner";

const IMG_BASE_URL = "https://matessa.in";

// --- HELPER: STATUS BADGE ---
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
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[safeStatus] || "bg-gray-100 text-gray-600"}`}>
      {safeStatus}
    </span>
  );
};

const OrderConfirmationPage = () => {
  const { orderId } = useParams(); 
  const dispatch = useDispatch();

  const { currentOrder, loading, error } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth); 

  useEffect(() => {
    if (orderId && orderId !== "undefined") {
       const isIdMismatch = !currentOrder || currentOrder.orderId?.toString() !== orderId.toString();
       if (isIdMismatch) {
          dispatch(fetchOrderDetails(orderId));
       }
    }
  }, [dispatch, orderId, currentOrder]);

  const getProductImage = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/150";
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`;
  };

  if (!orderId || orderId === "undefined") {
      return (
        <div className="h-screen flex flex-col justify-center items-center text-center p-4 bg-gray-50">
            <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Order Link</h2>
            <Link to="/shop" className="text-[var(--color-darkgreen)] underline font-bold">Return to Shop</Link>
        </div>
      );
  }

  if (loading) return <div className="h-screen flex justify-center items-center bg-gray-50"><Spinner /></div>;
   
  if (error || !currentOrder) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center p-4 bg-gray-50">
         <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
            <FaQuestionCircle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">We couldn't locate the order details.</p>
            <Link to="/shop" className="block w-full bg-[var(--color-darkgreen)] text-white py-3 rounded-xl font-bold">Return Home</Link>
         </div>
      </div>
    );
  }

  const order = currentOrder;
  const address = order.address || order.shippingAddress || {};
  const displayEmail = order.email || userInfo?.email || "N/A";

  // 🚨 FIX 1: Filter Ghost Items
  const validItems = (order.orderItems || []).filter(item => {
     return (item.product && item.product.productName) || item.productName || item.product_name;
  });

  // 🚨 FIX 2: Calculate Subtotal 
  const rawSubtotal = validItems.reduce((acc, item) => acc + (item.orderedProductPrice * item.quantity), 0);
  const finalTotal = order.totalAmount > 0 ? order.totalAmount : rawSubtotal;
  const displaySubtotal = rawSubtotal > 0 ? rawSubtotal : finalTotal; 

  // ✅ NEW: GET NAME FROM ADDRESS FIRST
  // This prioritizes the name entered in the Checkout Form
  const customerName = address.name || address.fullName || address.recipientName || userInfo?.username || "Valued Customer";

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-body pb-12">
      
      {/* HEADER */}
      <div className="bg-[var(--color-darkgreen)] pt-12 pb-24 px-4 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 ring-4 ring-white/10">
                 <FaCheckCircle className="text-white text-4xl" />
             </div>
             <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4 tracking-tight">
                 Order Confirmed!
             </h1>
             <p className="text-green-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                 {/* ✅ UPDATED: Uses Checkout Name */}
                 Thank you, <span className="font-bold text-white">{customerName}</span>! 
                 Your order <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">#{order.orderCode || order.orderId}</span> has been placed.
             </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        {/* ACTIONS BAR */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex flex-col">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Status</span>
                 <div className="flex items-center gap-3 mt-1">
                     <StatusBadge status={order.orderStatus} />
                     <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FaCalendarAlt size={12}/> {new Date(order.orderDate).toLocaleString()}
                     </span>
                 </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                 <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <FaPrint /> Print
                 </button>
                 <Link to="/shop" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-orange)] text-white rounded-xl font-bold hover:bg-[#e05515] shadow-md hover:shadow-lg transition-all transform active:scale-95">
                    <FaShoppingBag /> Shop More
                 </Link>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ITEMS & PROGRESS */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* TRACKER */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hidden md:block">
                 <h3 className="font-bold text-gray-800 mb-6">Order Timeline</h3>
                 <div className="relative flex justify-between">
                     <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                     <div className="relative z-10 bg-white px-2 flex flex-col items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                             <FaCheckCircle />
                         </div>
                         <span className="text-xs font-bold text-green-600">Placed</span>
                     </div>
                     <div className="relative z-10 bg-white px-2 flex flex-col items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                             <FaBox />
                         </div>
                         <span className="text-xs font-bold text-gray-400">Processing</span>
                     </div>
                     <div className="relative z-10 bg-white px-2 flex flex-col items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                             <FaTruck />
                         </div>
                         <span className="text-xs font-bold text-gray-400">Shipped</span>
                     </div>
                 </div>
             </div>

             {/* ITEMS LIST */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                     <FaBox className="text-[var(--color-darkgreen)]" /> Order Items
                   </h2>
                   <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600">
                      {validItems.length} Items
                   </span>
                </div>
                
                <div className="p-0">
                   {validItems.length === 0 ? (
                       <div className="p-8 text-center text-gray-500 italic">
                         <p>Items data is hidden but order is confirmed.</p>
                       </div>
                   ) : (
                       validItems.map((item, index) => {
                          const productName = item.product?.productName || item.productName || "Unknown Product";
                          const prodImage = item.product?.images?.[0] || item.product?.image || item.image;
                          const price = item.orderedProductPrice || item.price || 0;
                          
                          return (
                            <div key={index} className="flex gap-4 items-center p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                               <div className="w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                  <img 
                                    src={getProductImage(prodImage)}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                                  />
                                  <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md">x{item.quantity}</span>
                               </div>
                               
                               <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1">{productName}</h4>
                                  <p className="text-xs text-gray-500">Unit: ₹{price.toFixed(2)}</p>
                               </div>
                               
                               <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{(price * item.quantity).toFixed(2)}</p>
                               </div>
                            </div>
                          );
                       })
                   )}
                </div>
             </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-1 space-y-6">
             {/* SHIPPING */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2">
                       <FaMapMarkerAlt className="text-orange-500" /> Delivery Details
                   </h2>
                </div>
                <div className="p-6">
                   {/* Name in Address Card (Optional, if you want it here too) */}
                   <p className="font-bold text-gray-800 text-lg mb-1">{address.name || address.fullName || userInfo?.username || "Valued Customer"}</p>
                   
                   <p className="font-medium text-gray-600 text-sm mb-1">{address.addressLine1 || "Address"}</p>
                   <p className="text-gray-600 text-sm">{address.city || ""}{address.state ? `, ${address.state}` : ""}</p>
                   <p className="text-gray-600 text-sm mb-4">{address.country || "India"} - {address.pincode}</p>
                   {address.phoneNumber && (
                       <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm text-green-800 font-medium">
                           <FaPhone /> {address.phoneNumber}
                       </div>
                   )}
                </div>
             </div>

             {/* SUMMARY */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2">
                      <FaCreditCard className="text-blue-500" /> Order Summary
                   </h2>
                </div>
                <div className="p-6 space-y-3">
                   <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                       <span className="text-sm text-gray-500">Payment</span>
                       <span className="font-bold text-gray-800 text-sm">
                           {order.payment?.paymentMode === 'ONLINE' ? '💳 Online' : '💵 COD'}
                       </span>
                   </div>

                   <div className="flex justify-between items-center text-gray-600 text-sm">
                      <span>Subtotal</span>
                      <span>₹{displaySubtotal.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-gray-600 text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">FREE</span>
                   </div>
                   
                   <div className="pt-4 mt-2 border-t border-gray-100">
                      <div className="flex justify-between items-end">
                         <span className="font-bold text-gray-800">Grand Total</span>
                         <span className="text-2xl font-extrabold text-[var(--color-darkgreen)]">
                             ₹{finalTotal.toFixed(2)}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;