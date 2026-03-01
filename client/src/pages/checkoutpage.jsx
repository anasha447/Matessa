import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; 
import { 
  FaLock, FaTruck, FaShieldAlt, FaCreditCard, 
  FaMoneyBillWave, FaTag, FaTimesCircle, FaCheckCircle,
  FaGooglePay, FaCcVisa, FaCcMastercard
} from "react-icons/fa";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/slices/orderSlice";
import { clearCart, applyCoupon, removeCoupon } from "../redux/slices/cartSlice"; 

// ✅ 1. Import Analytics Helper
import { trackEvent } from "../utils/analytics";

// ✅ 2. DEFINE CONSTANTS
const IMG_BASE_URL = "https://matessa.in";
const API_URL = "https://matessa.in/api"; 

// ✅ COMPONENT OUTSIDE
const InputField = ({ label, name, type = "text", colSpan = "col-span-1", value, onChange, onBlur }) => (
    <div className={colSpan}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">{label}</label>
      <input
        type={type}
        name={name}
        value={value} 
        onChange={onChange} 
        onBlur={onBlur} // ✅ Added onBlur for tracking
        className="w-full rounded-lg border-gray-200 bg-gray-50 border px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all outline-none"
        placeholder="" 
        required
      />
    </div>
);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { userInfo } = useSelector((state) => state.auth);
  const { items, totalPrice, discount, couponCode: appliedCode, cartId } = useSelector((state) => state.cart);
  const { loading: orderLoading } = useSelector((state) => state.orders);

  // Local State
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [localLoading, setLocalLoading] = useState(false);
  const [couponInput, setCouponInput] = useState(""); 
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // Analytics Refs (to prevent duplicate events)
  const hasTrackedShipping = useRef(false);
  const hasTrackedPayment = useRef(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", state: "", pincode: "",
    country: "India",
  });

  // Helper for Images
  const getProductImage = (imageName) => {
    if (!imageName) return "/assets/placeholder.png";
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`;
  };

  // Redirect if Cart is Empty
  useEffect(() => {
    if (isOrderSuccess) return;
    if (!items || items.length === 0) {
        if (!orderLoading) {
            navigate("/shop");
        }
    }
  }, [items, navigate, isOrderSuccess, orderLoading]);

  // Reset Coupon on Mount
  useEffect(() => {
    if (cartId) {
        dispatch(removeCoupon(cartId));
    }
  }, [cartId, dispatch]);

  // Pre-fill Form
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.username || "",
        email: userInfo.email || "",
        street: userInfo.address?.street || "",
        city: userInfo.address?.city || "",
        pincode: userInfo.address?.pincode || "",
      }));
    }
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ ANALYTICS: Track Shipping Info (Once per session)
  // We trigger this when user leaves a field (onBlur) to show they interacted
  const handleInputBlur = () => {
      if (!hasTrackedShipping.current && formData.name && formData.email) {
          trackEvent("add_shipping_info", {
              ecommerce: {
                  currency: "INR",
                  value: finalTotal,
                  items: items.map(item => ({
                      item_id: item.productId,
                      item_name: item.productName,
                      price: item.specialPrice || item.price,
                      quantity: item.quantity
                  }))
              }
          });
          hasTrackedShipping.current = true;
      }
  };

  // ✅ ANALYTICS: Track Payment Info Selection
  const handlePaymentChange = (method) => {
      setPaymentMethod(method);
      
      // Fire event immediately on selection
      trackEvent("add_payment_info", {
          ecommerce: {
              currency: "INR",
              value: finalTotal,
              payment_type: method, // "COD" or "ONLINE"
              items: items.map(item => ({
                  item_id: item.productId,
                  item_name: item.productName,
                  price: item.specialPrice || item.price,
                  quantity: item.quantity
              }))
          }
      });
  };

  // Calculation Logic
  const finalTotal = totalPrice || 0;
  const discountAmount = discount || 0;
  const subtotal = finalTotal + discountAmount; 
  const discountRatio = subtotal > 0 ? discountAmount / subtotal : 0;

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (appliedCode) {
        toast.info("A coupon is already active.");
        return;
    }
    try {
      await dispatch(applyCoupon({ cartId, code: couponInput })).unwrap();
      toast.success("Coupon Applied Successfully!");
      setCouponInput(""); 
    } catch (err) {
      toast.error(err || "Invalid Coupon Code");
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = async () => {
    if (!cartId) return;
    try {
      await dispatch(removeCoupon(cartId)).unwrap();
      toast.info("Coupon Removed");
    } catch (err) {
      toast.error("Failed to remove coupon");
    }
  };

  // Payment Logic
  const handleRazorpayPayment = async () => {
    try {
        setLocalLoading(true);
        const { data: rzOrder } = await axios.post(
            `${API_URL}/payment/razorpay/create-order`,
            { amount: finalTotal },
            { headers: { Authorization: `Bearer ${userInfo?.token}` } }
        );

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: rzOrder.amount,
            currency: rzOrder.currency,
            name: "MaTeesa",
            description: "Order Payment",
            order_id: rzOrder.id,
            handler: async function (response) {
                await saveOrderToBackend("ONLINE", {
                    pgName: "Razorpay",
                    pgPaymentId: response.razorpay_payment_id,
                    pgStatus: "success",
                    pgResponseMessage: "Payment Verified"
                });
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone,
            },
            theme: { color: "#3E5F2D" },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response) {
            toast.error(`Payment failed: ${response.error.description}`);
            setLocalLoading(false);
        });
        rzp1.open();

    } catch (error) {
        toast.error("Could not initiate payment.");
        setLocalLoading(false);
    }
  };

  const saveOrderToBackend = async (mode, paymentDetails = {}) => {
    const shippingAddress = {
        addressLine1: formData.street,
        city: formData.city,
        state: formData.state || "MH",
        country: formData.country,
        pincode: formData.pincode,
        phoneNumber: formData.phone
    };

    const orderRequest = {
        email: formData.email,
        shippingAddress: shippingAddress,
        paymentMode: mode,
        pgStatus: paymentDetails.pgStatus || (mode === "COD" ? "pending" : "success"),
        pgName: paymentDetails.pgName || null,
        pgPaymentId: paymentDetails.pgPaymentId || null,
        pgResponseMessage: paymentDetails.pgResponseMessage || null,
        couponCode: appliedCode
    };

    try {
        setLocalLoading(true);
        const result = await dispatch(placeOrder({ paymentMode: mode, orderRequest })).unwrap();
        const targetId = result.orderId || result.data?.orderId || result.orderCode;

        if (!targetId) throw new Error("Order was placed, but ID is missing.");

        setIsOrderSuccess(true);
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        
        setTimeout(() => {
            navigate(`/order-confirmation/${targetId}`);
        }, 100);

    } catch (error) {
        console.error("Order Failure:", error);
        toast.error(error.message || "Failed to place order");
        setIsOrderSuccess(false); 
    } finally {
        setLocalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
        toast.error("Your cart is empty.");
        return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pincode) {
        toast.error("Please fill in all delivery details.");
        return;
    }

    if (formData.pincode.length < 5 || formData.pincode.length > 15) {
        toast.error("Pincode must be between 5 and 15 characters.");
        return;
    }

    try {
        setLocalLoading(true);
        if (paymentMethod === "ONLINE") {
            handleRazorpayPayment();
        } else {
            saveOrderToBackend("COD");
        }
    } catch (err) {
        setLocalLoading(false);
        const errMsg = err.response?.data?.message || "Failed to place order.";
        toast.error(errMsg);
    }
  };

  if (!isOrderSuccess && (!items || items.length === 0)) return null;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[#F8F9FA] font-body">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold text-[var(--color-darkgreen)] flex items-center justify-center gap-3">
          <FaLock className="text-xl opacity-80" /> Secure Checkout
        </h1>
        <p className="text-gray-500 mt-2 text-sm">Please fill in your details to complete your order</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: FORMS --- */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Shipping Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Shipping Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="Phone Number" name="phone" type="tel" colSpan="md:col-span-2" value={formData.phone} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="Street Address" name="street" colSpan="md:col-span-2" value={formData.street} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="State" name="state" value={formData.state} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} onBlur={handleInputBlur} />
                <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} onBlur={handleInputBlur} />
                
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">Country</label>
                    <input type="text" value="India" readOnly className="w-full rounded-lg border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* ✅ Payment Method Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                   Payment Method
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* 💳 ONLINE OPTION */}
                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                  paymentMethod === "ONLINE" 
                  ? "border-[var(--color-green)] bg-[#F0FDF4] shadow-md scale-[1.01]" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="ONLINE" 
                    checked={paymentMethod === "ONLINE"} 
                    onChange={() => handlePaymentChange("ONLINE")} // ✅ UPDATED HANDLER
                    className="hidden"
                  />
                  
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-colors ${
                       paymentMethod === "ONLINE" ? "bg-[var(--color-green)] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}>
                        <FaCreditCard />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-sm md:text-base ${paymentMethod === "ONLINE" ? "text-gray-900" : "text-gray-600"}`}>
                                Pay Online
                            </h3>
                            {paymentMethod === "ONLINE" && (
                                <div className="hidden sm:flex gap-2 text-gray-400">
                                    <FaGooglePay size={24} />
                                    <FaCcVisa size={20} />
                                    <FaCcMastercard size={20} />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Razorpay, UPI, Credit/Debit Cards</p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "ONLINE" ? "border-[var(--color-green)] bg-[var(--color-green)]" : "border-gray-300"
                    }`}>
                        {paymentMethod === "ONLINE" && <FaCheckCircle className="text-white text-xs" />}
                    </div>
                  </div>
                </label>

                {/* 💵 COD OPTION */}
                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                  paymentMethod === "COD" 
                  ? "border-[var(--color-green)] bg-[#F0FDF4] shadow-md scale-[1.01]" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={paymentMethod === "COD"} 
                    onChange={() => handlePaymentChange("COD")} // ✅ UPDATED HANDLER
                    className="hidden" 
                  />
                  
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-colors ${
                       paymentMethod === "COD" ? "bg-[var(--color-green)] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}>
                        <FaMoneyBillWave />
                    </div>

                    <div className="flex-1">
                        <h3 className={`font-bold text-sm md:text-base ${paymentMethod === "COD" ? "text-gray-900" : "text-gray-600"}`}>
                            Cash on Delivery
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Pay with cash upon arrival</p>
                    </div>

                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "COD" ? "border-[var(--color-green)] bg-[var(--color-green)]" : "border-gray-300"
                    }`}>
                        {paymentMethod === "COD" && <FaCheckCircle className="text-white text-xs" />}
                    </div>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SUMMARY (Sticky) --- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between pb-4 border-b border-gray-100">
                Order Summary <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{items.length} Items</span>
              </h2>

              {/* Product List */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                {items.map((item, index) => {
                    const itemPrice = item.specialPrice || item.price || 0;
                    const itemTotal = itemPrice * item.quantity;
                    const itemDiscounted = itemTotal - (itemTotal * discountRatio);

                    return (
                        <div key={index} className="flex gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                <img
                                    src={getProductImage(item.images?.[0] || item.image)} 
                                    alt={item.productName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = "/assets/placeholder.png"; }}
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                    {item.productName || "Product"}
                                </h4>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity}</p>
                                    
                                    <div className="text-right">
                                        {appliedCode ? (
                                            <>
                                                <span className="text-sm font-bold text-[var(--color-green)]">₹{itemDiscounted.toFixed(2)}</span>
                                            </>
                                        ) : (
                                            item.specialPrice > 0 ? (
                                                <>
                                                    <span className="text-sm font-bold text-gray-800">₹{itemTotal.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="text-sm font-bold text-gray-800">₹{itemTotal.toFixed(2)}</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>

              {/* COUPON FIELD */}
              <div className="mb-6 pt-4 border-t border-dashed border-gray-200">
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block tracking-wider">Discount Code</label>
                
                {appliedCode ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center animate-fade-in shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="bg-green-100 p-2 rounded-full text-green-600">
                               <FaTag size={14}/> 
                           </div>
                           <div>
                             <p className="text-green-800 text-sm font-bold tracking-wide">{appliedCode}</p>
                             <p className="text-green-600 text-xs">Coupon Applied</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-green-700 text-sm font-bold">- ₹{discountAmount.toFixed(2)}</span>
                           <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-all">
                             <FaTimesCircle size={18} />
                           </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <FaTag className="absolute left-3 top-3 text-gray-400" size={12}/>
                            <input 
                              type="text" 
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent transition-all uppercase placeholder-gray-400"
                              placeholder="Have a code?"
                            />
                        </div>
                        <button 
                          type="button" 
                          onClick={handleApplyCoupon}
                          disabled={!couponInput}
                          className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
                        >
                          Apply
                        </button>
                    </div>
                )}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="space-y-3 pt-4 border-t border-dashed border-gray-300">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold text-xs flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full"><FaTruck size={10}/> FREE</span>
                </div>

                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold text-sm animate-pulse-once">
                        <span>Total Savings</span>
                        <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-2">
                  <span className="text-gray-800 font-bold text-lg">Total Amount</span>
                  <div className="text-right">
                      <span className="text-xs text-gray-400 font-normal block mb-1">Including GST</span>
                      <span className="text-2xl font-extrabold text-[var(--color-darkgreen)]">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={localLoading || orderLoading}
                className="w-full mt-6 bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-3 transform hover:-translate-y-1"
              >
                {localLoading || orderLoading ? (
                  <span className="animate-pulse">Processing Order...</span>
                ) : (
                  <>Place Order <FaShieldAlt className="opacity-80" /></>
                )}
              </button>

              <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                <FaLock size={10} />  Secure Payment
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;