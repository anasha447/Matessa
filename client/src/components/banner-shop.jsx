import React, { useEffect, useState } from "react";
import bannerImage from "../assets/leaf-pattern.jpeg"; 

const ShopBanner = () => {
  const [text, setText] = useState("");
  const fullText = "Our Products";
  const typingSpeed = 100; 

  useEffect(() => {
    // 1. Always reset text on mount ensures clean slate
    setText(""); 
    
    let index = 0;
    
    const timer = setInterval(() => {
      // 2. Increment index first
      index++; 
      
      // 3. Use slice() instead of appending. This prevents double letters.
      setText(fullText.slice(0, index)); 
      
      if (index === fullText.length) {
        clearInterval(timer);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <h1 className="relative z-10 text-white text-5xl font-heading">
        {text}
        {/* Blinking Cursor */}
        <span className="border-r-4 border-white animate-pulse ml-1"></span>
      </h1>
    </div>
  );
};

export default ShopBanner;