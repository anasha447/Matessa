import React, { useState, useEffect, useRef } from 'react';
import { FaLeaf } from 'react-icons/fa'; // Or use your own SVG Gourd Icon

// --- DATA: EDIT THIS SECTION ---
const STEPS = [
  {
    id: 1,
    title: "Cultivating",
    text: "Our Yerba Mate is shade-grown in the native Atlantic Forest. We partner with local farmers who protect the ecosystem, ensuring that every leaf is harvested from trees growing naturally under the canopy, not in open monocultures.",
    // Replace with your actual image paths
    image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=1000&auto=format&fit=crop", 
    mobileImage: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Harvesting",
    text: "Harvesting is an art passed down through generations. Leaves and branches are hand-picked manually every two years, allowing the tree to regenerate fully. This patience ensures a robust flavor and a sustainable future for the forest.",
    image: "https://images.unsplash.com/photo-1626427218636-6927d7301c29?q=80&w=1000&auto=format&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1626427218636-6927d7301c29?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Processing",
    text: "Transformation begins immediately. We use a smoke-free air drying process. First, the 'Sapeco' (flash drying) seals in the nutrients, followed by a slow drying period. The leaves are then aged for 12 months to develop that signature Matessa golden flavor.",
    image: "https://images.unsplash.com/photo-1585671500249-14a51e66c778?q=80&w=1000&auto=format&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1585671500249-14a51e66c778?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "The Ritual",
    text: "From our forest to your gourd. Whether you drink it hot (Mate), cold (Tereré), or brewed in a French press, Matessa brings people together. It's not just a drink; it's a moment of connection and clarity.",
    image: "https://images.unsplash.com/photo-1560611425-41ef032d201e?q=80&w=1000&auto=format&fit=crop",
    mobileImage: "https://images.unsplash.com/photo-1560611425-41ef032d201e?q=80&w=600&auto=format&fit=crop"
  }
];

const MatessaJourney = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);

  // Setup Intersection Observer to detect scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveStep(index);
          }
        });
      },
      {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Triggers when element is in the middle 20% of screen
        threshold: 0
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-[#125740] text-white py-16 lg:py-24 overflow-hidden relative">
      
      {/* Header */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#fed107] mb-4">
          From Rainforest to Gourd
        </h2>
        <p className="text-gray-200 max-w-2xl mx-auto text-lg">
          Trace the journey of Matessa leaves through the Atlantic Forest.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0">
          
          {/* LEFT COLUMN: Scrollable Text Content */}
          <div className="relative">
            {/* The Dashed Vertical Line */}
            <div className="absolute left-4 lg:left-8 top-0 bottom-0 w-px border-l-2 border-dashed border-[#fed107]/50 h-full z-0"></div>

            <div className="space-y-24 lg:space-y-48 pb-24">
              {STEPS.map((step, index) => (
                <div 
                  key={step.id} 
                  ref={el => stepRefs.current[index] = el}
                  data-index={index}
                  className="relative z-10 pl-12 lg:pl-20 pr-4 transition-opacity duration-500"
                  style={{ opacity: activeStep === index ? 1 : 0.5 }} // Fade out inactive text
                >
                  
                  {/* Step Number/Dot */}
                  <div className="absolute left-[9px] lg:left-[25px] top-1 w-4 h-4 rounded-full bg-[#fed107] shadow-[0_0_10px_#fed107]"></div>

                  {/* Mobile Image (Visible only on small screens) */}
                  <div className="lg:hidden mb-6 rounded-xl overflow-hidden shadow-lg border-2 border-[#fed107]/20">
                    <img src={step.mobileImage} alt={step.title} className="w-full h-auto object-cover" />
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-[#fed107] mb-4 font-serif">
                    {step.title}
                  </h3>
                  <div 
                    className="text-gray-100 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: step.text }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Images (Desktop Only) */}
          <div className="hidden lg:block relative h-full">
            <div className="sticky top-[20vh] h-[60vh] flex items-center justify-center">
              
              {/* Central Gourd/Leaf Icon */}
              <div className="absolute z-20 -left-6 top-1/2 -translate-y-1/2 bg-[#125740] p-4 rounded-full border-4 border-[#fed107]">
                 <FaLeaf size={32} color="#fed107" />
              </div>

              {/* Image Stack */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#125740] bg-[#0d4230]">
                {STEPS.map((step, index) => (
                  <img
                    key={step.id}
                    src={step.image}
                    alt={step.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                      activeStep === index ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                    }`}
                  />
                ))}
                
                {/* Gradient Overlay for Text Readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#125740]/60 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MatessaJourney;