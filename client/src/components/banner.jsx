import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Assets ---
import bannerImg from "../assets/animationbg.png"; 
import bannerImg1 from "../assets/bannervibe1.png"; // PC Vibe
import bannerImg3 from "../assets/Mobilebanner.png"; // Mobile Banner
import brandName from "../assets/brandname.png"; 
import logo from "../assets/full.logo.png";

// --- Configuration: Define Slides here ---
const slideData = [
  {
    id: 0,
    mobile: bannerImg,   // Animation BG (Both)
    desktop: bannerImg,  // Animation BG (Both)
    isAnimationSlide: true // Flag to trigger steam/logo effects
  },
  {
    id: 1,
    mobile: bannerImg3,  // Mobile Banner (Mobile Only)
    desktop: bannerImg1, // Brand Vibe (PC Only)
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

  // --- Auto-slide logic ---
  useEffect(() => {
    // 10 seconds for animation slide (index 0), 5 seconds for others
    const intervalTime = current === 0 ? 10000 : 5000;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slideData.length);
    }, intervalTime);
    return () => clearTimeout(timer);
  }, [current]);

  // --- Helper: Background Effects ---
  const getBackgroundStyle = (index) => {
    // Only apply blur/pulse to the first slide (Animation BG)
    if (index === 0 && current === 0) {
      return "blur-[4px] scale-105 brightness-70 animate-pulseSlow";
    }
    return "blur-0 scale-100 brightness-100";
  };

  // --- Calm Inner Glow Animation ---
  const calmGlowAnimation = {
    y: [0, -8, 0], 
    filter: [
      "drop-shadow(0 0 0px rgba(234, 219, 162, 0))",
      "drop-shadow(0 0 10px rgba(234, 219, 162, 0.5)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))",
      "drop-shadow(0 0 0px rgba(234, 219, 162, 0))",
    ],
  };

  return (
    <div className="w-full h-[600px] sm:h-[500px] md:h-[600px] overflow-hidden relative bg-black">
      
      {/* 1. BACKGROUND SLIDER */}
      {slideData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          } ${getBackgroundStyle(index)}`} 
        >
          {/* LOGIC: Handle Different Images for Mobile vs Desktop */}
          {slide.mobile === slide.desktop ? (
            // CASE A: Same image for both (Slide 0)
            <img
              src={slide.mobile}
              alt={`banner ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            // CASE B: Different images (Slide 1)
            <>
              {/* Mobile Image (Hidden on MD+) */}
              <img
                src={slide.mobile}
                alt={`banner mobile ${index + 1}`}
                className="w-full h-full object-cover object-center block md:hidden"
              />
              {/* Desktop Image (Hidden on Small Screens) */}
              <img
                src={slide.desktop}
                alt={`banner desktop ${index + 1}`}
                className="w-full h-full object-cover object-center hidden md:block"
              />
            </>
          )}
        </div>
      ))}

      {/* 2. ANIMATED OVERLAY (Only shows on First Slide) */}
      <AnimatePresence>
        {current === 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            
            {/* LOGO CONTAINER */}
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