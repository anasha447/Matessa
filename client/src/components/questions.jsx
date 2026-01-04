import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "How much caffeine is in Yerba Mate?",
    answer:
      "A typical serving of Matessa Yerba Mate contains about 80-85mg of caffeine. This is slightly less than coffee but more than tea. The key difference is the 'Mateine' effect—it provides a smooth, sustained energy boost without the jittery crash often associated with coffee.",
  },
  {
    question: "Where is your Yerba Mate sourced from?",
    answer:
      "Sourced directly from elite Argentine farms, our Mate grows in the same rich rainforest atmosphere as premium coffee and cocoa. This native soil ensures an authentic, nutrient-dense leaf with a superior flavor profile.",
  },
  {
    question: "Why shouldn't I use boiling water?",
    answer:
      "Boiling water (100°C) burns the delicate leaves, resulting in a bitter taste and destroying some of the healthy nutrients. For the perfect brew, we recommend using hot water between 70°C and 80°C (160°F - 175°F).",
  },
  {
    question: "What does Matessa Mate taste like?",
    answer:
        "We crafted our 'Masala' blend specifically for the Indian taste it gives a warming taste with a touch of spices. The 'Lemon & Ginger' is zesty and refreshing. Finally, the classic Unflavoured delivers the original experience taste of yerba mate.",  },
  {
    question: "Is Yerba Mate suitable for my diet?",
    answer:
      "Absolutely. Matessa Yerba Mate is 100% natural, Vegan, Gluten-Free, and Keto-friendly. It contains zero sugar and practically zero calories, making it an excellent companion for Intermittent Fasting and weight loss journeys.",
  },
  {
    question: "Do I need a special straw (Bombilla) to drink it?",
    answer:
      "For the authentic South American experience, yes! The Bombilla acts as a filter to separate the leaves from the water as you sip. However, you can also brew our mate in a French Press or a standard tea infuser if you don't have a straw yet.",
  },
  {
    question: "Can I brew Mate in any cup?",
    answer:
      "Yes! While the traditional Gourd looks beautiful, it is not strictly necessary. You can prepare Matessa in your favorite ceramic mug, glass, or travel tumbler. The most important tool is the Bombilla (straw) to filter the leaves.",
  },
  {
    question: "What is the size of the Cup?",
    answer:
      "Traditional Mate gourds usually hold between 150ml to 250ml of liquid.",
  },
  {
    question: "How many times can you refill and re-use the Mate?",
    answer:
      "One of the best things about Yerba Mate is its longevity. You can refill your cup with hot water up to 10 times! Continue refilling and sipping until the flavor eventually washes out.",
  },
  {
    question: "How many spoons of mate should I put if I am brewing it in a tea pot?",
    answer:
      "If you are using a Tea Pot or French Press, we recommend adding about 1 to 2 tablespoons (approx. 10-12g) of Matessa Yerba Mate per cup of water. Adjust according to your taste preference for a stronger or milder brew.",
  },
  {
    question: "Can I brew it in milk?",
    answer:
      "Traditionally, Mate is brewed with water to fully experience the herbal notes. However, it is delicious with milk (known as 'Mate de Leche')! For the best creamy experience, we highly recommend using our Unflavoured Loose Leaf  variety, adding warm milk and perhaps a touch of honey.",
  },
  {
    question: "Can I add sugar to the Mate?",
    answer:
      "Yes, you can. If you are satisfied with your current weight, feel free to add sugar or honey. However, we recommend trying the original natural flavor first to enjoy the full healthy experience.",
  },
];

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div 
      className={`border-b border-gray-100 last:border-0 transition-colors duration-300 ${isOpen ? 'bg-green-50/50' : 'bg-white'}`}
    >
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-5 px-4 md:px-6 hover:bg-gray-50 transition-colors rounded-lg group"
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold font-body transition-colors ${isOpen ? 'text-[#1A4D2E]' : 'text-gray-700'}`}>
            {item.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`flex-shrink-0 ${isOpen ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#1A4D2E]'}`}
        >
          <ChevronDown size={20} strokeWidth={2.5} />
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
            <div className="px-4 md:px-6 pb-6 pt-0">
              {/* UPDATED FONT STYLE HERE: font-body font-semibold */}
              <p className="text-gray-600 font-body font-semibold leading-relaxed text-[15px] md:text-[16px]">
                {item.answer}
              </p>
            </div>
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
    <section className="py-20 bg-[#FDFBF7]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1A4D2E] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-yellow mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={activeIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            Still have questions? <a href="contact-us" className="text-[#1A4D2E] font-bold hover:text-[#D4AF37] transition-colors underline decoration-[#D4AF37]">Chat with us</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Questions;