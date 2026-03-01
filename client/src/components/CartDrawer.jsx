import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { trackEvent } from "../utils/analytics"; // ✅ Imported

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartItem, removeCartItem } from "../redux/slices/cartSlice";

// ✅ 1. DEFINE IMAGE BASE URL
const IMG_BASE_URL = "https://matessa.in";

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 2. Get Data from Redux
  const { items: rawItems = [], totalPrice = 0, cartId } = useSelector((state) => state.cart || {});
  const items = Array.isArray(rawItems) ? rawItems : [];

  // 3. Fetch Cart on Mount (if open)
  useEffect(() => {
    if (isOpen) {
        dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

  // ✅ 4. HELPER FUNCTION FOR IMAGES
  const getCartImage = (imageName) => {
    if (!imageName) return "/assets/placeholder.png";
    if (imageName.startsWith("http")) return imageName;
    return `${IMG_BASE_URL}/images/${imageName}`;
  };

  // 5. Handlers

  const handleQtyChange = (productId, operation, currentQty, variantId) => {
    if (operation === 'decrease' && currentQty <= 1) {
        const item = items.find(i => i.productId === productId && i.variantId === variantId);
        if (window.confirm("Remove this item?")) {
            
            // ✅ ANALYTICS: Track Removal (via Quantity Decrease)
            if (item) {
                trackEvent("remove_from_cart", {
                    ecommerce: {
                        currency: "INR",
                        value: item.specialPrice || item.price,
                        items: [{
                            item_id: item.productId,
                            item_name: item.productName,
                            price: item.specialPrice || item.price,
                            quantity: item.quantity,
                            item_variant: item.variant
                        }]
                    }
                });
            }

            dispatch(removeCartItem({ cartId, productId, variant: item?.variant }));
        }
    } else {
        dispatch(updateCartItem({ productId, operation, variantId }));
    }
  };

  const handleRemove = (productId, variant) => {
    // We need to find the item details BEFORE removing it to track it
    const itemToRemove = items.find(i => i.productId === productId && (!variant || i.variant === variant));

    if (itemToRemove) {
        // ✅ ANALYTICS: Track Removal (via Trash Icon)
        trackEvent("remove_from_cart", {
            ecommerce: {
                currency: "INR",
                value: itemToRemove.specialPrice || itemToRemove.price,
                items: [{
                    item_id: itemToRemove.productId,
                    item_name: itemToRemove.productName,
                    price: itemToRemove.specialPrice || itemToRemove.price,
                    quantity: itemToRemove.quantity,
                    item_variant: itemToRemove.variant
                }]
            }
        });
    }

    dispatch(removeCartItem({ cartId, productId, variant }));
  };

  const handleCheckout = () => {
    // ✅ ANALYTICS: Begin Checkout (The Funnel Starts!)
    trackEvent("begin_checkout", {
        ecommerce: {
            currency: "INR",
            value: totalPrice,
            items: items.map(item => ({
                item_id: item.productId,
                item_name: item.productName,
                price: item.specialPrice || item.price,
                quantity: item.quantity,
                item_category: item.categoryName || "General",
                item_variant: item.variant
            }))
        }
    });

    onClose();
    navigate('/checkoutpage');
  };

  // Animation Variants
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const drawerVariants = {
    visible: { x: 0 },
    hidden: { x: "100%" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold font-heading text-[#2F3B28]">
                Your Cart ({items.length})
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Items List OR Empty State */}
            <div className="flex-grow overflow-y-auto p-6 bg-[#F9F7F3]">
              {items.length === 0 ? (
                // --- EMPTY STATE ---
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-gray-500 text-lg">Your cart is empty.</p>
                  <button 
                    onClick={onClose} 
                    className="text-[#F26323] underline font-medium"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                // --- LIST OF ITEMS ---
                <ul className="space-y-4">
                  {items.map((item, idx) => (
                    <li key={`${item.productId}-${item.variantId || 'def'}-${idx}`} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 border border-[#E6E0D2]">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                        {/* ✅ USED NEW HELPER HERE */}
                        <img
                          src={getCartImage(item.images?.[0] || item.image)}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = "/assets/placeholder.png"; }}
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-[#2F3B28] line-clamp-1">{item.productName}</h3>
                          {item.variant && (
                              <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 block w-fit mt-1">
                                {item.variant}
                              </span>
                          )}
                          <p className="text-sm text-[#F26323] font-bold mt-1">
                             ₹ {(item.specialPrice || item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQtyChange(item.productId, 'decrease', item.quantity, item.variantId)}
                              className="p-1 px-2 hover:bg-gray-100 text-[#2F3B28]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQtyChange(item.productId, 'increase', item.quantity, item.variantId)}
                              className="p-1 px-2 hover:bg-gray-100 text-[#2F3B28]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemove(item.productId, item.variant)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer (Only if items exist) */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-[#F26323]">
                    ₹{Number(totalPrice).toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full block text-center bg-[#F26323] text-white py-3.5 rounded-lg font-bold hover:bg-[#d9551a] transition-colors shadow-lg shadow-orange-200"
                >
                  Proceed to Checkout
                </button>
                
                <div className="text-center mt-3">
                    <button 
                      onClick={onClose} 
                      className="text-sm text-gray-500 hover:text-[#2F3B28]"
                    >
                      Continue Shopping
                    </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;