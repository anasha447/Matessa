// src/components/ShopBanner.jsx
import React, { useEffect, useState } from "react";
import bannerImage from "../assets/leaf-pattern.jpeg"; // Replace with your image

const ShopBanner = () => {
  const [text, setText] = useState("");
  const fullText = "Ouur Products";
  const typingSpeed = 100; // ms per letter

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText((prev) => prev + fullText.charAt(i));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, typingSpeed);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative w-full h-[450px] flex items-center justify-center"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Typing Text */}
      <h1 className="relative z-10 text-white text-5xl font-heading">
        {text}
        <span className="border-r-4 border-white animate-pulse ml-1"></span>
      </h1>
    </div>
  );
};

export default ShopBanner;
