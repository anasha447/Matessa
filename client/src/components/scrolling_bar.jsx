import React from "react";

const ScrollingBar = () => {
  return (
    <div
      className="w-full bg-[#E85D1F] text-[#E9DDAF] h-[40px] overflow-hidden 
        whitespace-nowrap flex items-center font-body-simi-heading justify-center
        border-t-2 border-b-2 border-[#282828] shadow-lg"
      style={{
        fontSize: "16px",
        fontFamily: "Quicksand, sans-serif",
        fontWeight: "850",
      }}
    >
      <marquee behavior="scroll" direction="left" scrollamount="4" className="w-full">
        🎉 Special Offer: Get 20% off on your first order! | Free shipping over $50 🚚 | New flavors arriving soon! Stay tuned!
      </marquee>
    </div>
  );
};

export default ScrollingBar;
