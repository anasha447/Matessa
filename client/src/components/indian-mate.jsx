// src/components/IndianMateStory.jsx
import { motion } from "framer-motion";

// Image
import indianmate from "../assets/matevibe1.png";

export default function IndianMateStory() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      
      {/* 1. BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F3] via-[#fffbf2] to-[#FFF7ED] z-0" />
      
      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
        
        {/* --- PART 1: HEADING --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-black">
            The Magic Harmony
          </h2>
        </motion.div>


        {/* --- PART 2: THE IMAGE --- */}
        {/* Outer Wrapper: Handles the ENTRY animation (Fade In) */}
        <motion.div 
          className="relative mb-12 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* Inner Wrapper: Handles the SOUL animation (Float & Tilt) */}
            <motion.div
              animate={{ 
                y: [-8, 8, -8],      // Float Up/Down
                rotate: [-1, 1, -1]  // Tilt Left/Right
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
                {/* The Container Frame */}
                <div className="relative w-72 md:w-96 aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-200/50 bg-white">
                    
                    {/* The Image */}
                    <img 
                      src={indianmate}
                      alt="Indian Mate Fusion" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Inner Shadow */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
                </div>

                {/* Decorative Glow Behind */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200/60 to-green-200/60 rounded-[50px] blur-3xl opacity-50 -z-10" />
            </motion.div>
        </motion.div>


        {/* --- PART 3: TEXT --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg text-gray-600 leading-relaxed font-body max-w-xl relative z-10"
        >
          <p className="mb-4">
            A harmonious blend where the earthy richness of <span className="font-semibold text-[#2F3B28]">Yerba Mate</span> meets the warming embrace of <span className="font-semibold text-[#F26323]">Masala spices</span>.
          </p>
          <p className="italic text-[#2F3B28] font-medium opacity-80">
            "Balancing vitality with warmth. A global friendship in every sip."
          </p>
        </motion.div>

      </div>
    </section>
  );
}