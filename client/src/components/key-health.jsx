import React from "react";
import { Leaf, HeartPulse, BrainCircuit, Zap, Droplet, Scale } from "lucide-react";
import { motion } from "framer-motion";

// Updated data structure to handle themed colors for backgrounds and icons
const benefits = [
  {
    icon: Zap, // Passing the component itself, not an instance
    colorTheme: "yellow", // Used for dynamic tailwind classes
    title: "Natural Energy",
    desc: "A balanced caffeine source that increases alertness and physical endurance naturally.",
  },
  {
    icon: HeartPulse,
    colorTheme: "red",
    title: "Boosts Heart Health",
    desc: "May improve cholesterol levels and protect against heart disease with regular consumption.",
  },
  {
    icon: BrainCircuit, // Switched to BrainCircuit for a "smarter" look
    colorTheme: "blue",
    title: "Enhances Focus",
    desc: "Provides a gentle energy boost and improved mental clarity without the jitters of coffee.",
  },
  {
    icon: Leaf,
    colorTheme: "green",
    title: "Rich in Antioxidants",
    desc: "Packed with essential vitamins and minerals that keep your body healthy and strong.",
  },
  {
    icon: Droplet,
    colorTheme: "cyan",
    title: "Supports Hydration",
    desc: "Keeps your body refreshed while providing essential fluid intake alongside nutrients.",
  },
  {
    icon: Scale,
    colorTheme: "purple",
    title: "Weight Management", // Slightly shorter title
    desc: "Speeds up metabolism and helps reduce food cravings naturally.",
  },
];

// Framer Motion Variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each card appearing
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 }, // Start slightly down and transparent
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } // Smooth spring animation
  },
};

export default function YerbaMateBenefits() {
  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-[var(--color-darkgreen)] mb-3">
            Why Drink Mate?
          </h2>
    
        </motion.div>
        
        {/* Animated Grid Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} // Starts animating when 50px into view
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto"
        >
          {benefits.map((benefit, idx) => {
            const IconComponent = benefit.icon;

            // Dynamic Tailwind classes based on color theme
            const bgClass = `bg-${benefit.colorTheme}-100`;
            const textClass = `text-${benefit.colorTheme}-600`;
            const borderHoverClass = `hover:border-${benefit.colorTheme}-300`;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`group flex items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 ${borderHoverClass}`}
              >
                {/* Smarter Icon Container with localized animation */}
                <motion.div 
                  className={`flex-shrink-0 p-4 rounded-full ${bgClass} ${textClass} group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }} // Subtle wiggle on hover
                  transition={{ duration: 0.4 }}
                >
                  <IconComponent className="w-8 h-8" strokeWidth={2} />
                </motion.div>
                
                <div className="ml-5">
                  <h3 className="text-xl font-heading font-bold text-gray-800 mb-1 group-hover:text-[var(--color-darkgreen)] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-body font-medium">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}