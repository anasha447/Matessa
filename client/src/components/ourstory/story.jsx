// src/components/OurStoryParallax.jsx
import { motion } from "framer-motion";

const sections = [
  { title: "Discovery of Mate", text: "A South American treasure." },
  { title: "The Indian Masala Touch", text: "Blending cardamom, cinnamon & tulsi." },
  { title: "Perfect Companions", text: "Where warmth meets energy." },
  { title: "Indian Mate Today", text: "Shared across cultures." },
];

const OurStoryParallax = () => {
  return (
    <section className="relative bg-gradient-to-b from-lightgreen to-yellow py-20">
      <div className="max-w-5xl mx-auto px-6 space-y-32">
        {sections.map((sec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-center"
          >
            <h3 className="text-3xl font-heading text-darkgreen mb-4">{sec.title}</h3>
            <p className="text-lg text-gray-800">{sec.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OurStoryParallax;
