import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ FIX 1: Pointing back to the highly compressed WebP files!
import bannerImg from "../assets/animationbg.webp"; 
import bannerImg1 from "../assets/bannervibe1.webp"; 
import bannerImg3 from "../assets/mobanner.webp"; 
import brandName from "../assets/brandname.webp"; 
import logo from "../assets/full.logo.webp";

// --- Configuration ---
const slideData = [
  {
    id: 0,
    mobile: bannerImg,
    desktop: bannerImg, 
    isAnimationSlide: true 
  },
  {
    id: 1,
    mobile: bannerImg3, 
    desktop: bannerImg1, 
    isAnimationSlide: false
  }
];

// --- Sub-Component: Steam Particles ---
const SteamEffect = () => {
  const particles = [0, 1, 2];
  return (
    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 -z-10 w-full flex justify-center">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-white/60 rounded-full blur-md" 
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.6, 0], 
            y: -60, 
            x: [0, i % 2 === 0 ? 10 : -10, 0], 
            scale: [1, 2.5], 
          }}
          transition={{
            duration: 3, 
            repeat: Infinity,
            delay: i * 1.2, 
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function Banner() {
  const [current, setCurrent] = useState(0);

  // ✅ FIX 2: The Javascript preloader was completely removed here.
  // The browser's native fetchPriority="high" handles this much faster!

  // --- Auto-slide logic ---
  useEffect(() => {
    const intervalTime = current === 0 ? 10000 : 5000;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slideData.length);
    }, intervalTime);
    return () => clearTimeout(timer);
  }, [current]);

  const getBackgroundStyle = (index) => {
    if (index === 0 && current === 0) {
      return "blur-[4px] scale-105 brightness-70 animate-pulseSlow";
    }
    return "blur-0 scale-100 brightness-100";
  };

  const calmGlowAnimation = {
    y: [0, -8, 0], 
    filter: [
      "drop-shadow(0 0 0px rgba(234, 219, 162, 0))",
      "drop-shadow(0 0 10px rgba(234, 219, 162, 0.5)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
      "drop-shadow(0 0 0px rgba(234, 219, 162, 0))",
    ],
  };

  return (
    <div className="w-full h-[525px] sm:h-[500px] md:h-[600px] overflow-hidden relative bg-black">
      
      {/* 1. BACKGROUND SLIDER */}
      {slideData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          } ${getBackgroundStyle(index)}`} 
        >
          {/* ✅ FIX 3: Using <picture> so mobile devices don't download desktop images */}
          <picture>
            {slide.mobile !== slide.desktop && (
              <source media="(max-width: 767px)" srcSet={slide.mobile} type="image/webp" />
            )}
            <img
              src={slide.desktop}
              alt={`Matessa Banner ${index + 1}`}
              className="w-full h-full object-cover object-center"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              width="1920"
              height="600"
            />
          </picture>
        </div>
      ))}

      {/* 2. ANIMATED OVERLAY */}
      <AnimatePresence>
        {current === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.5, ease: "easeOut" }} 
              className="relative flex flex-col items-center"
            >
              <SteamEffect />

              <motion.img
                src={logo}
                alt="Matessa Logo"
                className="w-32 md:w-48 h-auto relative z-10 mt-8"
                layout 
                loading="eager"
                fetchPriority="high"
                width="192"
                height="192"
                animate={calmGlowAnimation} 
                transition={{
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.img
                src={brandName}
                alt="Matessa Brand"
                className="w-48 md:w-80 h-auto -mt-8 relative z-10"
                layout
                loading="eager"
                fetchPriority="high"
                width="320"
                height="120"
                animate={calmGlowAnimation} 
                transition={{
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5, 
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. NAVIGATION DOTS */}
      <div className="absolute bottom-6 right-6 flex space-x-2 z-30">
        {slideData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 ${
              index === current
                ? "w-6 h-3 rounded-md bg-[#FF6600]"
                : "w-3 h-3 rounded-full bg-white/70 hover:bg-[#FF6600]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}