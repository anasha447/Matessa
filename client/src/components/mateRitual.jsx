import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// --- 1. LOCAL VIDEO IMPORTS ---
import step1Video from "../assets/videos/step1..mp4";
import step2Video from "../assets/videos/step2.mp4";
import step3Video from "../assets/videos/step3.mp4";
import step4Video from "../assets/videos/step4.mp4";
import step5Video from "../assets/videos/step5.mp4";
import step6Video from "../assets/videos/step6.mp4";

// --- DATA ---
const STEPS = [
  {
    id: 1,
    title: "Fill the Gourd",
    description: "Fill the gourd (Cup) ½ of the way with yerba mate .",
    video: step1Video, 
  },
  {
    id: 2,
    title: "Shake & Tilt",
    description: "Cover the mouth of the gourd (or jar) with your hand, turn it over and shake it to even out the consistency of the yerba mate.",
    video: step2Video,
  },
  {
    id: 3,
    title: "Insert Bombilla",
    description: "The loose leaf yerba mate inside should remain at a 45° angle so you have space for the bombilla and water.",
    video: step3Video,
  },
  {
    id: 4,
    title: "pour cool water",
    description: "Gently pour room temperature water on the yerba mate leaves to prevent them from burning once you add hot water.",
    video: step4Video,
  },
  {
    id: 5,
    title: "Add Hot Water",
    description: "Pour hot water (not boiling, approx 70-80°C) into the Cup.",
    video: step5Video,
  },
  {
    id: 6,
    title: "Enjoy & Share",
    description: "Sip until you finish the gourd, fill it up with water again, pass to a friend, and come to life.",
    video: step6Video,
  },
];

const HowToPrepare = () => {
  // --- MOBILE SLIDER STATE ---
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = STEPS.length;

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-[#FDFBF7] text-[#2C3E50] font-body">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-heading font-extrabold text-[var(--color-darkgreen)] mb-4">
            How To Prepare Yerba Mate
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            For a traditional yerba mate experience, follow the steps below.
          </p>
        </div>

        {/* --- MAIN CONTENT LAYOUT --- */}
        <div className="flex flex-col xl:flex-row gap-12 items-start">
          
          {/* --- LEFT COLUMN: INGREDIENTS --- */}
          <div className="w-full xl:w-1/4 order-2 xl:order-1 xl:sticky xl:top-24 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold font-heading mb-6 border-b border-gray-100 pb-4 tracking-wider">
              WHAT YOU'LL NEED
            </h3>
            <ul className="space-y-6">
              <li className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">Yerba Mate</span>
                <span className="text-sm text-gray-500">Loose Leaf</span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">Gourd</span>
                <span className="text-sm text-gray-500">Or mason jar, ceramic cup</span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">Cool Water</span>
                <span className="text-sm text-gray-500">Room temperature</span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">Hot Water</span>
                <span className="text-sm text-gray-500">Approx 70-80°C (Not boiling)</span>
              </li>
              <li className="flex flex-col">
                <span className="font-bold text-gray-800 text-lg">Bombilla</span>
                <span className="text-sm text-gray-500">Traditional Filter Straw</span>
              </li>
            </ul>
          </div>

          {/* --- RIGHT SIDE: VIDEO DISPLAY --- */}
          <div className="w-full xl:w-3/4 order-1 xl:order-2">
            
            {/* === DESKTOP VIEW (Grid) === */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div key={step.id} className="group">
                  <div className="relative overflow-hidden rounded-[2rem] shadow-md border border-gray-200 aspect-square mb-4">
                    {/* ✅ FIX 1: preload="metadata" ensures the browser only downloads the first frame initially */}
                    <video 
                      src={step.video} 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      Step {step.id}
                    </div>
                  </div>
                  <div className="px-2">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* === MOBILE VIEW (Slider) === */}
            <div className="block md:hidden relative">
              
              {/* Slider Track */}
              <div className="relative overflow-hidden py-2">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {STEPS.map((step, idx) => (
                    <div key={step.id} className="min-w-full px-2 box-border">
                      <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100">
                         {/* Video Container */}
                         <div className="relative rounded-[2rem] overflow-hidden aspect-square w-full bg-gray-100">
                            {/* ✅ FIX 2: Only autoplay the specific video the user is currently looking at. 
                                Set hidden videos to preload="none" to save massive bandwidth. */}
                            <video 
                              src={step.video} 
                              autoPlay={activeSlide === idx} 
                              muted 
                              loop 
                              playsInline
                              preload={activeSlide === idx ? "metadata" : "none"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                              Step {step.id}
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Description (Changes with slide) */}
              <div className="text-center mt-6 px-4 min-h-[120px] transition-opacity duration-300">
                <h4 className="text-2xl font-heading font-bold text-[var(--color-darkgreen)] mb-2">
                  {STEPS[activeSlide].title}
                </h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {STEPS[activeSlide].description}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-8 mt-2 mb-8">
                <button 
                  onClick={prevSlide}
                  className="bg-white border border-gray-200 p-4 rounded-full shadow-sm active:scale-95 transition-all text-gray-700 hover:text-[var(--color-orange)]"
                >
                  <FaChevronLeft size={20} />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                  {STEPS.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeSlide === idx ? "w-8 bg-[var(--color-orange)]" : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button 
                  onClick={nextSlide}
                  className="bg-white border border-gray-200 p-4 rounded-full shadow-sm active:scale-95 transition-all text-gray-700 hover:text-[var(--color-orange)]"
                >
                  <FaChevronRight size={20} />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HowToPrepare;