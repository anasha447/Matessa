import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import logo from '../assets/full.logo.png'; 

const timelineData = [
  { year: "1600s", title: "The Beginnings", event: "Consumed by the Guaraní people for energy and sustenance." },
  { year: "1700s", title: "The Adoption", event: "Spanish colonists adopt Mate, spreading it across South America." },
  { year: "1800s", title: "National Icon", event: "Becomes the national drink of Argentina, Uruguay, and Paraguay." },
  { year: "1900s", title: "Expansion", event: "Mate culture crosses borders into Chile, Brazil, and the Middle East." },
  { year: "2000s", title: "Global Reach", event: "Exports surge worldwide. Mate becomes a hit in Europe & the USA." },
  { year: "2025", title: "Modern Fusion", event: "New blends like Masala & Lemon gaining popularity in India and beyond." },
];

// New Component: Active Dot that listens to the scroll progress
const ActiveDot = ({ scrollYProgress, index, total }) => {
  // Calculate the specific threshold for this dot.
  // e.g., if there are 6 items, item 0 is at 0.0, item 5 is at 1.0
  const threshold = index / (total - 1);
  
  // Create a small buffer (0.05) so the color changes right as the logo arrives
  const segmentStart = Math.max(0, threshold - 0.05);
  const segmentEnd = Math.min(1, threshold + 0.05);

  // Map scroll progress to color: Gray (#E5E7EB) -> Green (#2F3B28)
  const backgroundColor = useTransform(
    scrollYProgress,
    [segmentStart, segmentEnd], 
    ["#E5E7EB", "#2F3B28"]
  );

  // Also scale it up slightly when active
  const scale = useTransform(
    scrollYProgress,
    [segmentStart, segmentEnd],
    [0.8, 1.2]
  );

  return (
    <motion.div 
      style={{ backgroundColor, scale }}
      className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#F9F7F3] shadow-sm"
    />
  );
};

const TimelineItem = ({ item, index, scrollYProgress, total }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex items-center justify-between mb-24 w-full ${isEven ? "flex-row-reverse" : ""}`}>
      
      {/* TEXT CARD */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-[42%] md:w-5/12 ${isEven ? "text-right pr-4 md:pr-12" : "text-left pl-4 md:pl-12"}`}
      >
        <span className="block text-3xl md:text-5xl font-bold text-[#2F3B28]/10 font-heading mb-1 select-none">
          {item.year}
        </span>
        <h3 className="text-lg md:text-xl font-bold text-[#2F3B28] font-heading mb-1 md:mb-2">
          {item.title}
        </h3>
        <p className="text-xs md:text-base text-gray-600 font-body font-semibold leading-relaxed">
          {item.event}
        </p>
      </motion.div>

      {/* CENTER NODE (The Dot) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8">
        {/* Pass the scroll prop down to the dot */}
        <ActiveDot scrollYProgress={scrollYProgress} index={index} total={total} />
      </div>

      {/* EMPTY SPACE */}
      <div className="w-[42%] md:w-5/12" />
      
    </div>
  );
};

export default function MateTimeline() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"] 
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const logoTopPosition = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section 
      className="py-24 relative overflow-hidden bg-[#F9F7F3]"
    >
      <div className="text-center mb-16 px-6">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2F3B28]">
          Deep Cultural Roots
        </h2>
      </div>

      <div ref={containerRef} className="relative max-w-5xl mx-auto px-2 md:px-6 h-full min-h-[1000px]">
        
        {/* --- 1. THE CENTER LINE & LOGO CONTAINER (Top Layer) --- */}
        {/* Z-INDEX: 40 (Highest) */}
        <div className="absolute left-1/2 top-0 bottom-24 w-1 transform -translate-x-1/2 h-full z-40 pointer-events-none">
            
            {/* Background Line */}
            <div className="absolute left-0 top-0 w-[2px] h-full bg-[#2F3B28]/10 ml-[-1px]" />

            {/* Filling Green Line */}
            <motion.div 
               style={{ scaleY: smoothProgress, originY: 0 }}
               className="absolute left-0 top-0 w-[2px] h-full bg-[#2F3B28] ml-[-1px]"
            />

            {/* THE MOVING LOGO */}
            <motion.div
                style={{ top: logoTopPosition }}
                className="absolute left-[-20px] md:left-[-30px] w-10 h-10 md:w-16 md:h-16 flex items-center justify-center z-50"
            >
                <div 
                  className="w-full h-full bg-green" // Ensure this color matches your brand 'creamy' hex code
                  style={{
                    // Fallback color (Orange) if class fails
                    maskImage: `url(${logo})`,
                    WebkitMaskImage: `url(${logo})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
            </motion.div>
        </div>

        {/* --- 2. TIMELINE ITEMS CONTAINER (Bottom Layer) --- */}
        {/* Z-INDEX: 10 (Lower than Logo) */}
        <div className="relative z-10 pb-24">
          {timelineData.map((item, i) => (
            <TimelineItem 
                key={i} 
                item={item} 
                index={i} 
                // Pass the smooth progress to sync colors
                scrollYProgress={smoothProgress} 
                total={timelineData.length}
            />
          ))}
        </div>

      </div>
    </section>
  );
}