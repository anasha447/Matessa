import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Or 'motion/react' depending on your version

// --- 1. The Animation Component (Adapted from TrueFocus) ---
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

  // Animation Timing Configuration
  const animationDuration = 0.5; // Transition speed
  const showTime = 1.5;          // How long it stays visible (requested 1.5s)

  useEffect(() => {
    // Cycle through words automatically
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, showTime * 1000);

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    // Calculate the position of the brackets
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
      className="relative flex gap-3 md:gap-6 justify-center items-center flex-wrap mb-4"
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
              opacity: isActive ? 1 : 0.4, // Lower opacity for blurred items for better effect
            }}
          >
            {word.trim()}
          </span>
        );
      })}

      {/* The Brackets Animation */}
      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: 1
        }}
        transition={{
          duration: animationDuration,
          ease: "easeInOut"
        }}
      >
        {/* Corners styling - Matching the Brand Orange */}
        <span
          className="absolute w-3 h-3 border-[2px] rounded-[3px] top-[-6px] left-[-8px] border-r-0 border-b-0"
          style={{ borderColor: color }}
        ></span>
        <span
          className="absolute w-3 h-3 border-[2px] rounded-[3px] top-[-6px] right-[-8px] border-l-0 border-b-0"
          style={{ borderColor: color }}
        ></span>
        <span
          className="absolute w-3 h-3 border-[2px] rounded-[3px] bottom-[-6px] left-[-8px] border-r-0 border-t-0"
          style={{ borderColor: color }}
        ></span>
        <span
          className="absolute w-3 h-3 border-[2px] rounded-[3px] bottom-[-6px] right-[-8px] border-l-0 border-t-0"
          style={{ borderColor: color }}
        ></span>
      </motion.div>
    </div>
  );
};


// --- 2. Main Component ---
const AfterBanner = () => {
  return (
    <section 
      className="py-10 px-6 md:px-20"
      style={{ backgroundColor: '#F9F7F3' }}
    >
      <div className="max-w-4xl mx-auto text-center font-body">
        
        {/* REPLACED: Static H2 with Animated FocusText Component */}
        <FocusText 
          sentence="ENERGY | FOCUS | GUT HEALTH | IMMUNITY"
          separator="|"
          color="#F26323"
        />
        
        {/* Main Heading */}
        <h2 
          className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight" 
          style={{ color: '#2F3B28' }}
        >
          Covering All Aspects <br /> 
          <span style={{ color: '#F26323' }}>of Health</span>
        </h2>
        
        {/* Descriptive Text */}
        <p className="text-lg font font-semibold mb-10 leading-relaxed max-w-2xl mx-auto font-body"
           style={{ color: '#121212' }}>
          All-day energy & focus, no jitters or crash. Enjoy enhanced well-being every day.
        </p>
        
        {/* Try Now Button */}
        <Link 
          to="/product/3" 
          className="inline-block font-bold font-body py-3 px-12 rounded-full transition-transform duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
          style={{ 
            backgroundColor: '#F26323', 
            color: '#F9F7F3' 
          }}
        >
          Try Now
        </Link>

      </div>
    </section>
  );
};

export default AfterBanner;