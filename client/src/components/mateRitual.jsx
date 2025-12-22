// src/components/MateRitual.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORT VIDEOS ---
import video1 from "../assets/videos/5.mp4"; // Heat Water
import video2 from "../assets/videos/6.mp4"; // Add Leaves
import video3 from "../assets/videos/7.mp4"; // Pour Water
import video4 from "../assets/videos/4.mp4"; // Sip

const STEPS = [
  {
    id: 1,
    title: "Heat the Water",
    desc: "Heat water to 70-80°C. Never boiling, or you will burn the tea leaves and ruin the flavor.",
    video: video1,
  },
  {
    id: 2,
    title: "The Mountain",
    desc: "Fill 3/4 of the gourd. Tilt it 45° to create a 'montañita' (little mountain) of dry herb on one side.",
    video: video2,
  },
  {
    id: 3,
    title: "Pour & Infuse",
    desc: "Pour warm water into the hollow part. Let it absorb, then insert the bombilla firmly.",
    video: video3,
  },
  {
    id: 4,
    title: "The Ritual Sip",
    desc: "Don't stir the bombilla! Sip slowly. Share the gourd, returning it to the brewer after you finish.",
    video: video4,
  },
];

const MateRitual = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Calculate Progress (0 to 1)
  const totalSteps = STEPS.length;
  const progress = (activeStep + 1) / totalSteps;

  // SVG Configuration
  const radius = 48; 
  const circumference = 2 * Math.PI * radius; 
  
  useEffect(() => {
    const handleScroll = () => {
      const stepElements = document.querySelectorAll(".ritual-step");
      const offset = window.innerHeight * 0.5;

      stepElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < offset && rect.bottom > offset) {
          setActiveStep(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative bg-[#F9F7F3]">
      
      {/* HEADER */}
      <div className="pt-40 pb-0 md:pb-10 text-center px-6">
       
        <h2 className="text-4xl md:text-4xl font-heading font-bold text-[#2F3B28]">
        Preparation Steps        </h2>
      </div>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        
        {/* --- 1. STICKY VIDEO --- */}
        <div className="w-full md:w-1/2 h-[33vh] md:h-screen sticky top-[20vh] md:top-0 z-20 flex items-center justify-center pointer-events-none">
           
           {/* MOBILE MASK: This creates the "Disappear" effect */}
           {/* It sits BEHIND the video but IN FRONT of the scrolling text. */}
           {/* It is solid page color at top, fading to transparent at bottom. */}
           <div className="md:hidden absolute top-[-50vh] bottom-[-100px] left-0 right-0 z-[-1] bg-gradient-to-b from-[#F9F7F3] from-70% to-transparent" />

           {/* Circular Container */}
           <div className="relative w-60 h-60 md:w-96 md:h-96">
              
              {/* SVG RING ANIMATION */}
              <svg 
                className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] rotate-[-90deg]" 
                viewBox="0 0 100 100"
              >
                 {/* 1. Base Grey Ring */}
                 <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb" 
                    strokeWidth="4"
                    strokeLinecap="round"
                 />

                 {/* 2. Moving Green Ring */}
                 <motion.circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#16a34a" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ 
                        strokeDashoffset: circumference - (progress * circumference) 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="drop-shadow-lg"
                 />
              </svg>

              {/* The Video Mask */}
              <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                <AnimatePresence mode="wait">
                  <motion.video
                    key={STEPS[activeStep].id}
                    src={STEPS[activeStep].video}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {/* Step Counter Badge - Simplified (Step 01, Step 02) */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-full shadow-lg border border-gray-100 text-green-700">
                 <span className="font-heading font-bold text-lg whitespace-nowrap">
                    Step 0{activeStep + 1}
                 </span>
              </div>

           </div>
        </div>


        {/* --- 2. SCROLLING TEXT --- */}
        {/* z-10 puts it BEHIND the sticky container's mask (z-20) */}
        <div className="w-full md:w-1/2 relative z-10">
          <div className="hidden md:block h-[25vh]" />

          {STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`ritual-step min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center px-8 md:px-24 transition-all duration-500`}
            >
              <div 
                className={`transition-opacity duration-500 ${activeStep === index ? "opacity-100" : "opacity-30 blur-[2px]"}`}
              >
                {/* Green Accent Line */}
                <div className="w-12 h-1 mb-6 rounded-full bg-green-600" />
                
                <h3 className="text-2xl font-body font-bold mb-4 text-[#2F3B28]">
                  {step.title}
                </h3>
                
                <p className="text-xl font-body font-semibold text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
          
          <div className="h-[20vh]" />
        </div>

      </div>
    </section>
  );
};

export default MateRitual;