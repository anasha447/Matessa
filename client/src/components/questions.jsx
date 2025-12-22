import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    question: "What is Yerba Mate?",
    answer:
      "Yerba Mate is a traditional South American brew made from the leaves of the Ilex paraguariensis plant. It's known for its rich, earthy flavor and provides a smooth, sustained energy boost similar to coffee but with less jitteriness.",
  },
  {
    question: "How much caffeine is in Yerba Mate?",
    answer:
      "An 8-ounce cup of Yerba Mate typically contains about 85 milligrams of caffeine, which is slightly less than a standard cup of coffee but more than most teas. The energy release is often described as more balanced and sustained.",
  },
  {
    question: "How do I prepare traditional Yerba Mate?",
    answer:
      "Traditionally, Yerba Mate is prepared in a gourd and sipped through a metal straw called a 'bombilla'. To prepare, fill the gourd about two-thirds full with mate leaves, add cool water to moisten the leaves, then insert the bombilla and add hot (not boiling) water.",
  },
  {
    question: "What does Indian Mate taste like?",
    answer:
      "Our Indian Mate blends the classic, earthy notes of Yerba Mate with the warm, aromatic flavors of traditional Masala spices like cardamom, cinnamon, and cloves. The result is a bold, invigorating, and uniquely spicy-sweet brew.",
  },
  {
    question: "What are the health benefits of Yerba Mate?",
    answer:
      "Yerba Mate is rich in antioxidants, vitamins, and minerals. It's known to boost mental focus, improve physical performance, aid in digestion, and support weight management. The addition of Indian spices can also provide anti-inflammatory benefits.",
  },
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="text-lg font-semibold text-[var(--color-darkgreen)] font-body">
          {item.question}
        </span>
        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
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
            <p className="pt-4 text-gray-600 font-body">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Questions = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleItemClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-center mb-10 text-[var(--color-darkgreen)]">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="max-w-3xl mx-auto">
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
