import React, { useEffect, useRef, useState } from "react";

// Swap these for your actual images
import img1 from "../assets/banner.png";
import img2 from "../assets/masala.png";
import img3 from "../assets/lemon.png";
import img4 from "../assets/tulsi.png";

const SLIDES = [
  {
    id: 1,
    eyebrow: "Roots in Syria",
    title: "Where Mate Became Family",
    text: "I grew up in Syria where yerba mate is a ritual of connection—shared among friends, neighbors, and family. It’s more than a drink, it’s a circle.",
    img: img1,
  },
  {
    id: 2,
    eyebrow: "Journey to India",
    title: "Spices, Streets, and New Ideas",
    text: "Moving to India opened a world of color and flavor. I discovered masala chai culture and felt an instant kinship with the mate tradition.",
    img: img2,
  },
  {
    id: 3,
    eyebrow: "Experiment & Discovery",
    title: "Masala Meets Mate",
    text: "I started blending yerba mate with ginger, tulsi, mint, and warm spices—seeking a taste that feels Indian yet true to mate.",
    img: img3,
  },
  {
    id: 4,
    eyebrow: "The Vision",
    title: "From Syria to India, In Every Sip",
    text: "MaTeesa is my invitation to share a familiar warmth in a new way—natural energy, deep flavor, and a story that connects cultures.",
    img: img4,
  },
];

export default function OurStoryScroll() {
  const wrapperRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const wrapperTop = wrapperRef.current.offsetTop;
      const scrollY = window.scrollY - wrapperTop;
      const sectionHeight = window.innerHeight;

      // Clamp to 0 → SLIDES.length - 1
      const newIndex = Math.min(
        SLIDES.length - 1,
        Math.max(0, Math.floor(scrollY / sectionHeight))
      );

      setIndex(newIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSlide = (i) => {
    if (!wrapperRef.current) return;
    const targetY = wrapperRef.current.offsetTop + i * window.innerHeight;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `${SLIDES.length * 100}vh` }}
    >
      {/* Sticky full-screen section */}
      <section className="sticky top-0 h-screen overflow-hidden">
        {/* Image layer */}
        <div className="absolute inset-0">
          {SLIDES.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.img}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Text content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 max-w-4xl mx-auto">
          <p className="text-[#E9DDAF] uppercase tracking-widest text-sm md:text-base">
            {SLIDES[index].eyebrow}
          </p>
          <h1 className="mt-2 text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            {SLIDES[index].title}
          </h1>
          <p className="mt-4 text-white/90 text-base md:text-lg max-w-2xl">
            {SLIDES[index].text}
          </p>
        </div>

        {/* Dots Navigation */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={`w-3.5 h-3.5 rounded-full transition ${
                i === index
                  ? "bg-[#E85D1F] scale-110"
                  : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute left-0 right-0 bottom-6 mx-auto w-64 h-1 bg-white/20 rounded">
          <div
            className="h-1 bg-[#E85D1F] rounded transition-all"
            style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
          />
        </div>
      </section>
    </div>
  );
}
