// src/components/ShopBanner.jsx
import React, { useEffect, useState } from "react";
import bannerImage from "../assets/oursto.webp"; // Ensure this path is correct

const OurStoryBanner = () => {
  // State to trigger the fade-in effect
  const [isVisible, setIsVisible] = useState(false);

  // Define the text as an array of lines
  const textLines = [
    "We are on a Mission To Help",
    "The World Feel Better",
    "One Sip at a Time.",
  ];

  useEffect(() => {
    // Trigger the fade-in shortly after the component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full h-[450px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blur overlay */}
      {/* HOW TO CHANGE IT: Change backdrop-blur-sm to a smaller arbitrary value like backdrop-blur-[2px] or remove it entirely. */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"></div>

      {/* Fading & Sliding Text container */}
      <div
        className={`relative z-10 transition-all duration-1000 ease-out transform ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
        }`}
      >
        {/*
           Added 'leading-tight' for better spacing between multiple lines.
           Mapping through the array to create line breaks.
        */}
        <h1 className="text-[#FDF5E6] text-3xl md:text-5xl font-heading text-center px-4 leading-tight">
          {textLines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {/* Add a line break if it's not the last line */}
              {index < textLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
      </div>
    </div>
  );
};

export default OurStoryBanner;