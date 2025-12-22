import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const StorySection = ({ section, index }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row items-center justify-center gap-12 ${
        index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Main Image with subtle zoom-in */}
      <motion.img
        src={section.image}
        alt={section.title}
        className="w-80 h-100 object-cover rounded-2xl shadow-xl"
        initial={{ opacity: 0, scale: 0.9, x: index % 2 === 0 ? -100 : 100 }}
        animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
        transition={{ duration: 1 }}
      />

      {/* Text with fade-up effect */}
      <motion.div
        className="max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2 }}
      >
        <h3 className="text-2xl font-semibold font-heading mb-4">{section.title}</h3>
        <p className="text-gray-600 font-body font-semibold">{section.text}</p>
      </motion.div>
    </div>
  );
};

export default StorySection;
