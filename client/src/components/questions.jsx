import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react"; // Changed import

const faqData = [
  {
    question: "What is Yerba Mate?",
    answer:
      "Yerba Mate is a traditional South American brew made from the leaves of the Ilex paraguariensis plant. It's known for its rich, earthy flavor and provides a smooth, sustained energy boost similar to coffee but with less jitteriness.",
  },
  {
    question: "How much caffeine is in Yerba Mate?",
    answer:
      "An 8-ounce cup of Yerba Mate typically contains about 85 milligrams of caffeine, which is slightly less than a standard cup of coffee but more than most teas. The energy release is often described as more balanced and sustained than coffee spikes.",
  },
  {
    question: "Where is your Yerba Mate sourced from?",
    answer:
      "Our premium Yerba Mate is directly imported from elite estates in Argentina, South America, ensuring the highest quality and authentic flavor profile.",
  },
  {
    question: "How do I prepare traditional Yerba Mate?",
    answer:
      "Traditionally, Yerba Mate is prepared in a gourd (mate cup). Fill it about two-thirds full with leaves, tilt it to one side, pour in a little cool water to moisten the leaves, insert the bombilla (filtered straw), and then top up with hot (not boiling) water.",
  },
  {
    question: "Why shouldn't I use boiling water?",
    answer:
      "Using boiling water (100°C) can 'burn' the leaves, resulting in a very bitter taste and potentially damaging some of the beneficial nutrients. We recommend using water around 70-80°C (160-175°F) for the best flavor experience.",
  },
  {
    question: "What does Indian Mate taste like?",
    answer:
      "Our special 'Masala Flavour' blends the classic, earthy notes of South American Yerba Mate with warm traditional Indian spices like cardamom, cinnamon, cloves, and star anise. The result is a bold, aromatic, and uniquely spicy-sweet brew.",
  },
  {
    question: "What are the health benefits of Yerba Mate?",
    answer:
      "Yerba Mate is a powerhouse of antioxidants, vitamins, and minerals. It's known to boost mental focus, improve physical performance, and aid in digestion. The natural caffeine provides energy without the crash often associated with sugary energy drinks.",
  },
  {
    question: "Is Matessa Yerba Mate suitable for my diet?",
    answer:
      "Yes! Our Yerba Mate is naturally Gluten-Free, Keto-friendly, Vegan, and diet-friendly. It's an excellent zero-sugar beverage option that can also aid in weight management routines.",
  },
  {
    question: "Can I drink Yerba Mate cold?",
    answer:
      "Absolutely. Cold-brewed Mate is known traditionally as 'Tereré'. It's incredibly refreshing, especially in hot weather. Just prepare it using cold water or juice and lots of ice instead of hot water.",
  },
  {
    question: "Do I need a special straw (Bombilla) to drink it?",
    answer:
      "While you can brew Yerba Mate in a French Press or a regular tea infuser, the traditional experience requires a Bombilla. It's a metal straw with a filter at the bottom designed to let you sip the brewed liquid while keeping the loose leaves out of your mouth.",
  },
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="text-lg font-semibold text-[var(--color-darkgreen)] font-body pr-4">
          {item.question}
        </span>
        {/* Replaced Plus/Minus with animated ChevronDown */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 text-[var(--color-darkgreen)]"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-gray-600 font-body leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Questions = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleItemClick = (index) => {
    // If clicked index is already active, close it (set to null), otherwise open it
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-4 text-[var(--color-darkgreen)]">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto font-body">
          Everything you need to know about getting started with Yerba Mate.
        </p>
        <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={activeIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;