// src/components/OurStorySplit.jsx
import { motion } from "framer-motion";

const OurStorySplit = () => {
  return (
    <section className="bg-white py-16 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Image with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center"
        >
          <img src="/matecup.jpg" alt="Mate Cup" className="w-80 rounded-2xl shadow-xl" />
        </motion.div>

        {/* Text Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-heading text-darkgreen mb-6">
            Our Story: When Masala Met Mate
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Yerba mate, cherished in South America, found a new home in India.
            With the warmth of spices like <span className="font-semibold">cardamom, cinnamon, and tulsi</span>,
            we created a blend that celebrates both cultures. 
          </p>
          <p className="mt-4 text-lg text-gray-700">
            This is how Indian Mate was born — a fusion of energy, tradition,
            and flavor, crafted for today’s explorers.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStorySplit;
