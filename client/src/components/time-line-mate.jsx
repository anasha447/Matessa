import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const timelineData = [
  { year: "1600s", title: "Indigenous Roots", event: "Consumed by the Guaraní people for energy and sustenance." },
  { year: "1700s", title: "The Adoption", event: "Spanish colonists adopt Mate, spreading it across South America." },
  { year: "1800s", title: "National Icon", event: "Becomes the national drink of Argentina, Uruguay, and Paraguay." },
  { year: "1900s", title: "Expansion", event: "Mate culture crosses borders into Chile, Brazil, and the Middle East." },
  { year: "2000s", title: "Global Reach", event: "Exports surge worldwide. Mate becomes a hit in Europe & the USA." },
  { year: "2025", title: "Modern Fusion", event: "New blends like Masala & Mint gain popularity in India and beyond." },
];

const TimelineItem = ({ item, index }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex items-center justify-between mb-24 w-full ${isEven ? "flex-row-reverse" : ""}`}>
      
      {/* 1. EMPTY SPACE (Desktop only) */}
      <div className="hidden md:block w-5/12" />

      {/* 2. CENTER NODE (The Orange Dot) */}
      {/* Mobile: Left aligned (24px center). Desktop: Center aligned. */}
      <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 z-20">
        <motion.div 
           initial={{ scale: 0 }}
           whileInView={{ scale: 1 }}
           viewport={{ once: true, margin: "-50px" }} // Trigger earlier
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className="w-4 h-4 rounded-full bg-[#F26323] ring-4 ring-[#F9F7F3] shadow-md"
        />
      </div>

      {/* 3. CONTENT CARD */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`w-full md:w-5/12 pl-16 md:pl-0 ${isEven ? "md:text-right md:pr-10" : "md:pl-10"}`}
      >
        {/* Year Number - Added Spacing */}
        <span className="block text-5xl font-bold text-[#2F3B28]/10 font-heading mb-2 select-none">
          {item.year}
        </span>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-[#2F3B28] font-heading mb-2">
          {item.title}
        </h3>
        
        {/* Text */}
        <p className="text-base text-gray-600 font-body font-semibold leading-relaxed">
          {item.event}
        </p>
      </motion.div>
    </div>
  );
};

export default function MateTimeline() {
  const containerRef = useRef(null);
  
  // Adjusted scroll offsets for better mobile visibility
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end center"] 
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section 
      className="py-24 relative overflow-hidden" 
      style={{ backgroundColor: '#F9F7F3' }}
    >
      <div className="text-center mb-20 px-6">
        <h2 className="text-sm font-bold tracking-[0.2em] text-[#F26323] uppercase mb-3">
          Our Heritage
        </h2>
        {/* RENAMED SECTION */}
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2F3B28]">
          A Timeless Ritual
        </h2>
      </div>

      <div ref={containerRef} className="relative max-w-5xl mx-auto px-6">
        
        {/* --- THE SCROLLING LINE --- */}
        
        {/* 1. Static Gray Background Line */}
        {/* Fixed 'left-[23px]' to align perfectly with the 48px wide node center (24px - 1px width) */}
        <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[#2F3B28]/10 transform md:-translate-x-1/2" />
        
        {/* 2. Animated Green Line (Fills on Scroll) */}
        <motion.div 
            style={{ scaleY, originY: 0 }}
            className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[#2F3B28] transform md:-translate-x-1/2 z-10"
        />

        {/* --- TIMELINE ITEMS --- */}
        <div className="relative z-20">
          {timelineData.map((item, i) => (
            <TimelineItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* --- ENDING ORNAMENT --- */}
        <div className="flex md:justify-center justify-start md:pl-0 pl-[18px] mt-[-50px]">
           <div className="w-3 h-3 rounded-full bg-[#2F3B28] opacity-20" />
        </div>

      </div>
    </section>
  );
}