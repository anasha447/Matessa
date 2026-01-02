import React, { useState, useEffect } from "react";
import { FaGift, FaTimes, FaPaperPlane, FaCopy } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { subscribeUser, resetSubscriber } from "../redux/slices/subscriberSlice";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

const GuestPopup = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.subscriber);
  
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  // 1. Check if user already subscribed or dismissed in this session
  useEffect(() => {
    const hidden = sessionStorage.getItem("guest_popup_hidden");
    if (hidden) setIsDismissed(true);

    // Auto-open after 5 seconds if not dismissed
    const timer = setTimeout(() => {
        if (!hidden && !isOpen) setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Handle API Response
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetSubscriber());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    dispatch(subscribeUser(email));
  };

  const handleClose = () => {
    setIsOpen(false);
    // Remember preference for session so we don't annoy user
    sessionStorage.setItem("guest_popup_hidden", "true");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText("MATESSA15");
    toast.success("Code copied to clipboard!");
  };

  if (isDismissed && !isOpen) return null; // Completely hide if dismissed

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 font-body">
      
      {/* --- THE POPUP FORM --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white w-80 shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
          >
            {/* Header Image/Color */}
            <div className="bg-[var(--color-darkgreen)] p-6 text-center relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-white/60 hover:text-white"
              >
                <FaTimes />
              </button>
              <h3 className="text-2xl font-heading font-bold text-[var(--color-yellow)]">
                {success ? "Welcome!" : "Get 15% OFF"}
              </h3>
              <p className="text-green-100 text-sm mt-1">
                {success ? "Here is your discount code" : "Subscribe to our newsletter and unlock your discount."}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                // --- SUCCESS STATE (Show Coupon) ---
                <div className="text-center">
                   <div className="bg-orange-50 border-2 border-dashed border-[var(--color-orange)] rounded-lg p-3 mb-4">
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Use Code at Checkout</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl font-bold text-gray-800 tracking-wider">MA15</span>
                        <button onClick={copyToClipboard} className="text-[var(--color-orange)] hover:text-orange-700">
                           <FaCopy />
                        </button>
                      </div>
                   </div>
                   <button 
                     onClick={handleClose}
                     className="text-sm text-gray-500 underline hover:text-gray-800"
                   >
                     Close and Shop
                   </button>
                </div>
              ) : (
                // --- INPUT STATE ---
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-orange)] text-white font-bold py-3 rounded-lg hover:bg-[#d9551a] transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? "Processing..." : <>Unlock Discount <FaPaperPlane size={12} /></>}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-1">
                    We don't spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- THE BUBBLE BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors relative ${
            isOpen ? "bg-gray-400" : "bg-[var(--color-orange)] animate-bounce-slow"
        }`}
      >
        {isOpen ? <FaTimes size={20} /> : <FaGift size={24} />}
        
        {/* Notification Badge on Bubble */}
        {!isOpen && !success && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-yellow)]"></span>
          </span>
        )}
      </motion.button>

    </div>
  );
};

export default GuestPopup;