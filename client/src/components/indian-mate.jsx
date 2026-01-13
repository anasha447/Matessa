// src/components/IndianMateStory.jsx
import { motion } from "framer-motion";
import indianmate from "../assets/HARMONY.png";

export default function IndianMateStory() {
  return (
    <section className="relative py-16 md:py-16 px-6 overflow-hidden">
      
      {/* 1. BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F3] via-[#fffbf2] to-[#FFF7ED] z-0" />
      
      <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* --- PART 1: HEADING --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#2F3B28]">
            The Magic Harmony
          </h2>
        </motion.div>

        {/* --- PART 2: THE IMAGE (Updated for Width > Height) --- */}
        <motion.div 
          className="relative mb-8 md:mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div
              animate={{ 
                y: [-8, 8, -8],      
                rotate: [-1, 1, -1]  
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
                {/* The Container Frame - CHANGED HERE */}
                {/* Changed aspect-square to aspect-video (16:9) and increased width */}
                <div className="relative w-full max-w-lg md:max-w-3xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-200/50 bg-white z-20">
                    <img 
                      src={indianmate}
                      alt="Indian Mate Fusion" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
                </div>

                {/* Decorative Glow Behind */}
                <div className="absolute -inset-8 bg-gradient-to-tr from-orange-300/40 to-green-300/40 rounded-full blur-3xl opacity-60 -z-10" />
            </motion.div>
        </motion.div>

        {/* --- PART 3: TEXT --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 max-w-lg px-4" 
        >
          <p className="text-base md:text-xl text-gray-700 leading-relaxed font-body mb-6">
            A harmonious blend where the earthy richness of <span className="font-semibold text-[#2F3B28]">Yerba Mate</span> meets the warming embrace of <span className="font-semibold text-[#F26323]">Masala spices</span>.
          </p>
          <p className="text-sm md:text-lg italic text-[#2F3B28] font-medium opacity-90 border-t border-gray-200 pt-4">
            "Balancing vitality with warmth. A global friendship in every sip."
          </p>
        </motion.div>

      </div>
    </section>
  );
}