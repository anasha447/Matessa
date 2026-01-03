import React from "react";

const ScrollingBar = () => {
  return (
    <div
      // UPDATED: Changed background to Matessa Green and text to Cream
      // UPDATED: Border uses existing Tailwind class
      className="w-full bg-darkgreen text-[#F4EBD0] h-[44px] overflow-hidden 
        whitespace-nowrap flex items-center font-body-simi-heading justify-center
        border-t-2 border-b-2 border-orange shadow-lg z-50 relative"
      style={{
        fontSize: "16px",
        fontFamily: "Quicksand, sans-serif",
        fontWeight: "700",
        letterSpacing: "0.5px"
      }}
    >
      {/* Note: <marquee> is technically deprecated but works in most browsers. */}
      <marquee behavior="scroll" direction="left" scrollamount="6" className="w-full flex items-center">
        <span className="mx-4">
           <strong>Get</strong>  <span style={{color: "var(--color-yellow)"}}>15% OFF</span> On The First Order + A <span style={{color: "var(--color-yellow)"}}>FREE Traditional Bombilla!</span>
        </span>
        <span className="mx-4">|</span>
        <span className="mx-4">
          {/* Replaced Gold background with CSS variable */}
          Use Coupon Code: <strong style={{backgroundColor: "var(--color-yellow)", padding: "2px 8px", borderRadius: "4px", color: "#1A4D2E"}}>MATE15</strong> At Checkout
        </span>
        <span className="mx-4">|</span>
        <span className="mx-4">
          🚚 Free Shipping On All Orders
        </span>
      </marquee>
    </div>
  );
};

export default ScrollingBar;