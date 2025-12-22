import React, { useEffect, useRef, useState } from "react";
import img from "../assets/zoomedleaf.jpg";
/**
 * QuoteParallax
 * Props:
 *  - backgroundImage (string) : url for background image
 *  - quote (string)
 *  - author (string)
 *  - overlayOpacity (number 0-1) optional
 */
export default function QuoteParallax({
  backgroundImage = img
  ,
  quote = "A Sip From Nature, A Taste Of Cultures",
  author = "MATESSA",
  overlayOpacity = 0.55,
}) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  // Parallax effect: small translateY based on scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = null;

    const onScroll = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // when element in viewport, compute a small offset
      const windowHeight = window.innerHeight || 1;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
      // map progress to -10 -> 10 px
      const translate = (progress - 0.5) * 20;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setOffset(translate));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Inspirational quote"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "240px" }}
      backgroundColor="#EADBA2"
    >
      {/* Background image with parallax translate */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-center bg-cover transform-gpu transition-transform duration-300"
        style={{
            
          backgroundImage: `url(${backgroundImage})`,
          transform: `translate3d(0, ${offset}px, 0)`,
          filter:  "grayscale(0.2) saturate(0.9) brightness(0.88) contrast(1.05)", // Filters
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(15, 35, 20, ${overlayOpacity})` }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="text-center">
          <blockquote className="mx-auto max-w-3xl">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-heading text-white leading-tight drop-shadow-sm">
              “{quote}”
            </p>
            <footer className="mt-4">
              <span className="text-sm sm:text-base text-yellow font-body">{author}</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
