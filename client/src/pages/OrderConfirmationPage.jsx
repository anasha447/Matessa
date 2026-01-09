import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom"; 
import { useDispatch, useSelector } from "react-redux";
import { 
  FaCheckCircle, FaBox, FaUser, FaMapMarkerAlt, FaCreditCard, 
  FaCalendarAlt, FaEnvelope, FaPhone, FaArrowRight, FaShoppingBag 
} from "react-icons/fa";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import Spinner from "../components/Spinner";

// 1. DEFINE IMAGE BASE URL
const IMG_BASE_URL = "https://matessa.in";

// --- STATUS BADGE COMPONENT ---
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

  // 2. HELPER FUNCTION FOR IMAGES
  const getProductImage = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/150";
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`;
  };

  if (!orderId || orderId === "undefined") {
      return (
        <div className="h-screen flex flex-col justify-center items-center text-center p-4">
            <h2 className="text-xl font-bold text-red-500">Invalid Order Link</h2>
            <Link to="/" className="text-blue-600 underline">Return to Shop</Link>
        </div>
      );
  }

  if (loading) return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
   
  if (error || !currentOrder) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Order Not Found</h2>
        <Link to="/" className="text-blue-600 underline">Return Home</Link>
      </div>
    );
  }

  // --- DATA PREPARATION ---
  const order = currentOrder;
  const address = order.address || order.shippingAddress || {};

  // ✅ FIX 1: Filter Ghost Items
  const validItems = (order.orderItems || []).filter(item => 
      item.product && item.product.productName
  );

  // ✅ FIX 2: Calculate Subtotal from Valid Items only
  const rawSubtotal = validItems.reduce((acc, item) => acc + (item.orderedProductPrice * item.quantity), 0);
  const finalTotal = order.totalAmount > 0 ? order.totalAmount : rawSubtotal;

  // ✅ FIX 3: Correct Email Logic (Order -> User -> Fallback)
  const displayEmail = order.email || userInfo?.email || "N/A";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto">
        
        {/* --- 1. SUCCESS BANNER --- */}
        <div className="bg-[var(--color-darkgreen)] rounded-2xl shadow-xl p-8 text-center text-white mb-8 relative overflow-hidden">
             <div className="relative z-10 flex flex-col items-center">
                 <div className="bg-white text-[var(--color-darkgreen)] w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg">
                     <FaCheckCircle size={40} />
                 </div>
                 <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-heading">Order Confirmed!</h1>
                 <p className="text-green-100 text-lg max-w-xl">Thank you for your purchase.</p>
             </div>
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* --- 2. HEADER INFO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
           <div>
              <h2 className="text-2xl font-extrabold text-gray-900 flex flex-wrap items-center gap-3">
                 Order #{order.orderCode || order.orderId} 
                 <StatusBadge status={order.orderStatus} />
              </h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                 <FaCalendarAlt /> Placed on {new Date(order.orderDate).toLocaleString()}
              </p>
           </div>
           
           <Link to="/shop" className="bg-[var(--color-orange)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e05515] transition-all flex items-center gap-2 shadow-md transform active:scale-95">
                <FaShoppingBag /> Continue Shopping
           </Link>
        </div>

        {/* --- 3. MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: ITEMS & PAYMENT */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* ITEMS LIST */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                     <FaBox className="text-blue-500" /> Order Items
                   </h2>
                   <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600">
                      {validItems.length} Items
                   </span>
                </div>
                
                <div className="p-6 space-y-6">
                   {validItems.length === 0 ? (
                       <div className="p-4 text-center text-gray-500 italic">No valid items found.</div>
                   ) : (
                       validItems.map((item, index) => {
                          const prodImage = item.product?.images?.[0] || item.product?.image;
                          
                          return (
                            <div key={index} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
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

             {/* PAYMENT INFO */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                      <FaCreditCard className="text-green-600" /> Payment Info
                   </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Method</p>
                      <p className="font-bold text-gray-800">
                          {order.payment?.paymentMode === 'ONLINE' ? '💳 Online' : '💵 COD'}
                      </p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.payment?.pgStatus === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                          {order.payment?.pgStatus?.toUpperCase() || "PENDING"}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT COL: CUSTOMER & TOTALS */}
          <div className="lg:col-span-1 space-y-6">
             {/* Customer */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                       <FaUser className="text-orange-500" /> Customer
                   </h2>
                </div>
                <div className="p-6 space-y-5">
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Contact</p>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 break-all bg-gray-50 p-2 rounded border border-gray-100">
                          {/* ✅ FIX 3: Display Correct Email */}
                          <FaEnvelope className="text-gray-400"/> {displayEmail}
                      </div>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Shipping To</p>
                      <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                          <FaMapMarkerAlt className="absolute top-4 right-4 text-gray-300 text-xl"/>
                          <p className="font-bold text-gray-800 mb-1">{address.addressLine1 || "Street Info"}</p>
                          <p>{address.city || ""}{address.state ? `, ${address.state}` : ""}</p>
                          <p className="font-medium text-gray-800 mt-1">{address.country || "India"} - {address.pincode}</p>
                          {address.phoneNumber && (
                              <div className="mt-3 pt-3 border-t border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-2">
                                  <FaPhone className="text-green-600"/> {address.phoneNumber}
                              </div>
                          )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Total Summary */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                   <h2 className="font-bold text-gray-800 text-lg">Total Summary</h2>
                </div>
                <div className="p-6 space-y-3">
                   <div className="flex justify-between items-center text-gray-600 text-sm">
                      <span>Subtotal</span>
                      <span>₹{rawSubtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-600 text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">FREE</span>
                   </div>
                   <div className="border-t border-dashed border-gray-200 my-4"></div>
                   <div className="flex justify-between items-end">
                      <span className="font-bold text-gray-800 mb-1">Grand Total</span>
                      <span className="text-3xl font-extrabold text-[var(--color-darkgreen)]">
                          ₹{finalTotal.toFixed(2)}
                      </span>
                   </div>
                </div>
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <Link to="/" className="text-sm text-gray-500 hover:text-[var(--color-orange)] font-medium transition-colors flex items-center justify-center gap-1">
                        Back to Homepage <FaArrowRight size={12}/>
                    </Link>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;