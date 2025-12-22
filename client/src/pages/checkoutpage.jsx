import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; 

// Redux
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";

const API_URL = "http://localhost:5000/api";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { userInfo } = useSelector((state) => state.auth);
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { loading: orderLoading } = useSelector((state) => state.orders);

  // Local State
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" or "ONLINE"
  const [localLoading, setLocalLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "", // Added state field usually needed for AddressDTO
    pincode: "",
    country: "India",
  });

  // Pre-fill form if logged in
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name: userInfo.username || "",
        email: userInfo.email || "",
        // Adjust these fields based on your actual User Profile DTO structure
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

  // Calculations
  const subtotal = totalPrice || 0;
  const shippingCost = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const finalTotal = subtotal + shippingCost + tax;

  // --- 1. RAZORPAY LOGIC ---
  const handleRazorpayPayment = async () => {
    try {
        setLocalLoading(true);
        // Create Order ID on Server (Razorpay specific endpoint)
        // Ensure you have this endpoint to generate the Razorpay Order ID
        const { data: rzOrder } = await axios.post(
            `${API_URL}/payment/razorpay/create-order`,
            { amount: finalTotal }, // Send amount
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
                // ✅ PAYMENT SUCCESSFUL -> NOW SAVE ORDER TO DB
                await saveOrderToBackend("ONLINE", {
                    pgName: "Razorpay",
                    pgPaymentId: response.razorpay_payment_id,
                    pgStatus: "SUCCESS",
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

  // --- 2. SAVE ORDER TO BACKEND ---
  const saveOrderToBackend = async (mode, paymentDetails = {}) => {
    // 1. Construct AddressDTO (matches Backend)
    const shippingAddress = {
        street: formData.street,
        buildingName: "", // Optional
        city: formData.city,
        state: formData.state || "N/A",
        country: formData.country,
        pincode: formData.pincode
    };

    // 2. Construct OrderRequestDTO (matches Backend)
    const orderRequest = {
        email: formData.email, // Required by Backend
        shippingAddress: shippingAddress,
        paymentMode: mode, 
        // Payment Gateway Details (Only if ONLINE)
        pgName: paymentDetails.pgName || null,
        pgPaymentId: paymentDetails.pgPaymentId || null,
        pgStatus: paymentDetails.pgStatus || null,
        pgResponseMessage: paymentDetails.pgResponseMessage || null
    };

    try {
        setLocalLoading(true);
        // 3. Dispatch to Redux
        const result = await dispatch(placeOrder({ paymentMode: mode, orderRequest })).unwrap();
        
        // 4. Success Handling
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        navigate(`/order-confirmation/${result.orderId}`); // Check if backend returns 'orderId' or 'order_id'
        
    } catch (error) {
        toast.error(error || "Failed to place order");
    } finally {
        setLocalLoading(false);
    }
  };

  // --- 3. FORM SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "ONLINE") {
      handleRazorpayPayment();
    } else {
      // COD
      saveOrderToBackend("COD");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-12 bg-[var(--color-white)]">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-[var(--color-darkgreen)]">
          Checkout
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 [color:var(--color-green)]">
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State (Optional)</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border" readOnly />
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY & PAYMENT */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 [color:var(--color-green)]">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
                <div className="flex justify-between"><span>Items ({items.length})</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 [color:var(--color-green)]">Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  Online Payment (Razorpay)
                </label>
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={localLoading || orderLoading}
              className="w-full mt-8 text-white px-6 py-4 rounded-md font-semibold transition duration-300 [background-color:var(--color-orange)] hover:opacity-90 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {localLoading || orderLoading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;