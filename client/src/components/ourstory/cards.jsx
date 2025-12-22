// src/components/OurStoryCards.jsx
import { motion } from "framer-motion";

const cards = [
  { title: "South America", text: "Mate discovered in ancient traditions." },
  { title: "India", text: "Spices & masala creating soulful blends." },
  { title: "Fusion", text: "Mate + Masala = Indian Mate." },
  { title: "Today", text: "A drink for explorers & dreamers." },
];

const OurStoryCards = () => {
  return (
    <section className="bg-white py-20 px-6">
      <h2 className="text-3xl md:text-4xl font-heading text-center mb-12">
        The Story in Four Steps
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="p-6 bg-lightgreen rounded-2xl shadow-lg text-center"
          >
            <h3 className="text-xl font-semibold text-darkgreen">{card.title}</h3>
            <p className="mt-2 text-gray-700">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OurStoryCards;
