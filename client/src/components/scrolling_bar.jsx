import React from "react";

const ScrollingBar = () => {
  return (
    <div
      className="w-full bg-darkgreen text-[#F4EBD0] h-[42px] overflow-hidden 
        flex items-center shadow-lg z-30 relative border-t-1 border-orange"
      style={{
        fontFamily: "Quicksand, sans-serif",
        fontWeight: "700",
        letterSpacing: "0.5px"
      }}
    >
      {/* Injecting a tiny custom animation so you don't have to edit tailwind configs */}
      <style>
        {`
          @keyframes marquee-scroll {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee-scroll 25s linear infinite;
            will-change: transform;
          }
          /* Bonus: Pauses the scrolling when the user hovers over it to read the code! */
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* The scrolling container */}
      <div className="w-full">
        <div className="animate-marquee cursor-pointer">
          <span className="mx-4 text-[16px]">
             <strong>Get</strong> <span style={{color: "var(--color-yellow)"}}>15% OFF</span> On The First Order + A <span style={{color: "var(--color-yellow)"}}>FREE Traditional Bombilla!</span>
          </span>
          <span className="mx-4 text-[16px]">|</span>
          <span className="mx-4 text-[16px]">
            Use Coupon Code: <strong style={{backgroundColor: "var(--color-yellow)", padding: "2px 8px", borderRadius: "4px", color: "#1A4D2E"}}>MATE15</strong> At Checkout
          </span>
          <span className="mx-4 text-[16px]">|</span>
          <span className="mx-4 text-[16px]">
             Free Shipping On All Orders
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScrollingBar;