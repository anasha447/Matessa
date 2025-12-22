import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();

  // Replaced openCart with navigation because Redux doesn't control UI state by default
  const handleOpenCart = () => {
    navigate('/cart'); // Navigates to the full cart list
  };

  return (
    <div className="container mx-auto text-center py-20">
      <h1 className="text-3xl font-bold mb-4">Your Cart Has a New Home!</h1>
      <p className="text-lg text-gray-600 mb-8">
        We've moved the cart to a convenient slide-out drawer.
      </p>
      <button
        onClick={handleOpenCart}
        className="bg-[var(--color-orange)] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
      >
        Open Cart
      </button>
      <Link
        to="/shop"
        className="block mt-4 text-[var(--color-green)] hover:underline"
      >
        Or continue shopping
      </Link>
    </div>
  );
};

export default CartPage;