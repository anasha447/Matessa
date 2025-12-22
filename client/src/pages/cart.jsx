import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartItem, removeCartItem, clearCart } from "../redux/slices/cartSlice";
import { getImageUrl } from "../utils/imageUrl"; 

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ 1. Get Data from Redux
  // Default to empty array to prevent crashes during loading
  const { items = [], totalPrice = 0, cartId } = useSelector((state) => state.cart || {});

  // ✅ 2. Fetch Cart on Load
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // ✅ 3. Handlers
  const setQty = (productId, newQty, currentQty) => {
    if (newQty > currentQty) {
      dispatch(updateCartItem({ productId, operation: "increase" }));
    } else if (newQty < currentQty) {
      if (newQty < 1) {
        // If goes below 1, trigger remove
        if (window.confirm("Remove this item?")) {
          dispatch(removeCartItem({ cartId, productId }));
        }
      } else {
        dispatch(updateCartItem({ productId, operation: "decrease" }));
      }
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeCartItem({ cartId, productId }));
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the cart?")) {
      dispatch(clearCart());
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-25">
        <h1 className="text-3xl font-heading font-bold text-[#2F3B28] mb-4 ">Your Cart</h1>
        <p className="text-[#2F3B28] font-heading">
          Your cart is empty.{" "}
          <Link to="/shop" className="text-[#F26323] underline">
            Continue shopping
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[#2F3B28] mb-6">Your Cart</h1>

      <div className="bg-[#F9F7F3] rounded-xl shadow-lg overflow-hidden">
        {items.map((item) => (
          <div
            key={item.productId} // ✅ Backend uses productId
            className="flex items-center justify-between gap-4 border-b border-[#E6E0D2] p-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(item.image)}
                className="h-16 w-16 object-contain"
                alt={item.productName}
              />
              <div>
                <p className="text-[#2F3B28] font-medium">
                  {item.productName} {/* ✅ Backend uses productName */}
                </p>
                <p className="text-[#F26323] font-semibold">
                   ₹ {item.specialPrice || item.price}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded bg-[#EADBA2] hover:bg-[#F3CB57] text-[#2F3B28]"
                onClick={() => setQty(item.productId, item.quantity - 1, item.quantity)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                readOnly // ✅ Read-only because updates happen via API increment/decrement
                className="w-14 text-center border border-[#CFC497] rounded bg-white"
              />
              <button
                className="w-8 h-8 rounded bg-[#EADBA2] hover:bg-[#F3CB57] text-[#2F3B28]"
                onClick={() => setQty(item.productId, item.quantity + 1, item.quantity)}
                aria-label="Increase quantity"
              >
                +
              </button>
              <button
                className="ml-4 text-red-600 hover:underline"
                onClick={() => handleRemove(item.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="p-4 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded bg-[#EADBA2] text-[#2F3B28] hover:bg-[#F3CB57]"
          >
            Clear Cart
          </button>

          <div className="text-right">
            <p className="text-lg text-[#2F3B28]">
              Subtotal: <span className="font-bold text-[#F26323]">₹ {totalPrice.toFixed(2)}</span>
            </p>
            <button 
              onClick={() => window.location.href = '/checkoutpage'}
              className="mt-3 w-full md:w-auto px-6 py-3 rounded-lg bg-[#2F3B28] text-[#E9DDAF] hover:bg-[#7A9D3E] cursor-pointer transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}