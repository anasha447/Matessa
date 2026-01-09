import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- 1. The Animation Component (Unchanged logic, just style tweaks) ---
const FocusText = ({ 
  sentence, 
  separator = '|', 
  color = '#F26323',
  blurAmount = 4 
}) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const animationDuration = 0.5; 
  const showTime = 1.5;         

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, showTime * 1000);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    });
  }, [currentIndex, words.length]);

  return (
    <div
      ref={containerRef}
      className="relative flex gap-3 md:gap-6 justify-center items-center flex-wrap mb-6"
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => (wordRefs.current[index] = el)}
            className="relative font-body font-bold tracking-widest uppercase text-sm md:text-base transition-all duration-500"
            style={{
              color: color,
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isActive ? 1 : 0.4,
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {word.trim()}
          </span>
        );
      })}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: 0.9
        }}
        transition={{ duration: animationDuration, ease: "easeInOut" }}
      >
        {/* Corners styling */}
        <span className="absolute w-3 h-3 border-[2px] rounded-[3px] top-[-6px] left-[-8px] border-r-0 border-b-0" style={{ borderColor: color }}></span>
        <span className="absolute w-3 h-3 border-[2px] rounded-[3px] top-[-6px] right-[-8px] border-l-0 border-b-0" style={{ borderColor: color }}></span>
        <span className="absolute w-3 h-3 border-[2px] rounded-[3px] bottom-[-6px] left-[-8px] border-r-0 border-t-0" style={{ borderColor: color }}></span>
        <span className="absolute w-3 h-3 border-[2px] rounded-[3px] bottom-[-6px] right-[-8px] border-l-0 border-t-0" style={{ borderColor: color }}></span>
      </motion.div>
    </div>
  );
};

// --- 2. Main Component ---
const AfterBanner = () => {
  return (
    <section 
      className="relative py-16 px-6 md:px-20 overflow-hidden"
      style={{ backgroundColor: '#F9F7F3' }}
    >
      {/* Background Decor (Subtle Gradient) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fde4d8 0%, transparent 70%)' }}
      ></div>

      {/* Floating Decor Element (Abstract Leaf) */}
      

      <div className="max-w-4xl mx-auto text-center font-body relative z-10">
        
        {/* Animated Header */}
        <FocusText 
          sentence="ENERGY | FOCUS | GUT HEALTH | IMMUNITY"
          separator="|"
          color="#F26323"
        />
        
        {/* Main Heading with Entrance Animation */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight tracking-tight" 
          style={{ color: '#2F3B28' }}
        >
          Covering All Aspects <br className="hidden md:block" /> 
          <span style={{ color: '#F26323' }}>of Health</span>
        </motion.h2>
        
        {/* Enhanced Description */}
        <motion.p 
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.2 }}
  className="text-lg md:text-xl font-medium mb-10 leading-relaxed max-w-2xl mx-auto font-body"
  style={{ color: '#4A5545' }}
>
  Experience <span className="text-gray-900 font-bold">
    balanced <span className="text-orange">energy</span> & calm <span className="text-lightgreen">clarity, </span>
  </span> 
  <br className="hidden md:block" />
  A clean, natural lift without the jitters,
  <span className="text-gray-900 font-bold bg-orange-50 px-1 rounded mx-1">
    elevating your well-being,
  </span> 
  every day.
</motion.p>
        
        {/* Buttons Container */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          {/* Primary Button */}
          <Link 
            to="/product/52" 
            className="w-full sm:w-auto font-bold font-body py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-200 hover:-translate-y-1 active:scale-95"
            style={{ 
              backgroundColor: '#F26323', 
              color: '#F9F7F3' 
            }}
          >
            Try Now
          </Link>

          {/* Secondary Button (Ghost/Outline style) */}
          <Link 
            to="/what.is.mate" 
            className="w-full sm:w-auto font-bold font-body py-3 px-8 rounded-full border-1 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
            style={{ 
              borderColor: '#2F3B28', 
              color: '#2F3B28',
              backgroundColor: 'transparent'
            }}
          >
            <span>Don't know Mate?!</span>
            {/* Tiny arrow animation on hover */}
            <motion.span 
              className="inline-block"
              transition={{ repeat: Infinity, duration: 1 }}
            >
             
            </motion.span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default AfterBanner;