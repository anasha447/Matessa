import React from "react";
import { motion } from "framer-motion";
import StackGallery from "./stackUsage";


// ✅ Import local images from assets
import LeafPattern from "../assets/leaf-pattern1.png";
import CircularGallery from './mate-Gallery';

export default function WhatIsMate() {
  return (
    <section
      className="py-16 px-6 md:px-20 relative overflow-hidden"
      style={{
        backgroundColor: "#EADBA2", // Light beige tone
      }}
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-[#3E5F2D]/50 mix-blend-multiply"
        style={{
          backgroundImage: `url(${LeafPattern})`,
          backgroundSize: "1515px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          opacity: 0.3,
          filter: "grayscale(0.2) saturate(0.9) brightness(0.88) contrast(1.05)",
          zIndex: 0,
        }}
      ></div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* ✅ KEY CHANGE: 
             We removed the separate motion.h2. 
             We wrap everything in a DIV (not a P tag) to allow valid HTML nesting.
          */}
          <div className="text-lg font-body font-semibold text-black mb-4 leading-relaxed">
            
            {/* ✅ INLINE HEADER: 
              - 'inline' keeps it on the same line.
              - 'text-3xl' makes it bigger.
              - 'font-bold' makes it bold.
            */}
            <h2 className="inline text-3xl font-bold text-black mr-2">
              Yerba Mate
            </h2>

            {/* Rest of the text follows immediately */}
            <span className="inline">
              (pronounced <em>mah-teh</em>) comes from the holly tree that is found in the
              green forests of South America. Long ago the Nations (Guaraní tribes) of
              Paraguay, Argentina, and Brazil were the first to use its leaves. They
              called mate a gift of nature, drinking it for energy, focus, and strength
              during daily life. It was also a way to sit together, share stories, and
              feel connected. From the very beginning, mate was more than a drink — it was
              a tradition of health, friendship, and community.
            </span>
          </div>

          <p className="text-lg font-body font-semibold text-black mb-4 leading-relaxed">
            From the streets of Buenos Aires to the cafes of Europe, mate has
            become a global favorite. Athletes, artists, and health lovers enjoy
            this energizing brew as a natural alternative to coffee.
          </p>
        </motion.div>

        {/* Gallery Section */}
        
          <StackGallery/>

       

      </div>
    </section>
  );
}