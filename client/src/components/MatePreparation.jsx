import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MatePreparation = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Refs for animated elements
  const kettleRef = useRef(null);
  const steamRef = useRef(null);
  const gourdRef = useRef(null);
  const yerbaRef = useRef(null);
  const waterStreamRef = useRef(null);
  const waterLevelRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // Master Timeline linked to Scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", // Start when top of container hits top of viewport
          end: "+=3000",    // The animation lasts for 3000px of scrolling
          pin: true,        // Pin the container in place
          scrub: 1,         // Smooth scrubbing (1s lag for softness)
          // markers: true, // Uncomment to debug start/end points
        }
      });

      // --- STAGE 1: HEATING THE WATER ---
      // 1. Reset initial states (safety)
      tl.set(steamRef.current, { opacity: 0, y: 10 })
        .set(waterStreamRef.current, { scaleY: 0, transformOrigin: "top center" })
        .set(yerbaRef.current, { scaleY: 0, transformOrigin: "bottom center" })
        .set(waterLevelRef.current, { scaleY: 0, transformOrigin: "bottom center" });

      // 2. Heat Animation
      tl.to(kettleRef.current, { 
        fill: "#e67e22", // Turn Orange (Hot)
        duration: 1 
      })
      .to(kettleRef.current, { 
        x: "+=2", 
        yoyo: true, 
        repeat: 10, 
        duration: 0.05 
      }, "<") // Shake while changing color
      .to(steamRef.current, { 
        opacity: 1, 
        y: -20, 
        stagger: 0.2,
        duration: 1 
      }, "<0.5"); // Steam rises


      // --- STAGE 2: FILLING THE YERBA ---
      // 3. Move Kettle away, Bring in Gourd
      tl.to(kettleRef.current, { x: -200, opacity: 0.5, duration: 1 }, "phase2")
        .to(steamRef.current, { opacity: 0 }, "phase2")
        .fromTo(gourdRef.current, 
          { x: 200, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 1 }, 
          "phase2"
        );

      // 4. Fill Gourd with Yerba (Green mound rises)
      tl.to(yerbaRef.current, { 
        scaleY: 1, 
        duration: 1.5, 
        ease: "power1.inOut" 
      });


      // --- STAGE 3: POURING WATER ---
      // 5. Bring Kettle Back (Tilted)
      tl.to(kettleRef.current, { 
        x: 60, // Position above cup
        y: -120, 
        rotation: -45, // Tilt
        opacity: 1, 
        fill: "#3498db", // Back to blue (water inside) or keep orange
        duration: 1 
      });

      // 6. Pour Stream
      tl.to(waterStreamRef.current, { 
        scaleY: 1, 
        duration: 0.5 
      });

      // 7. Water Level Rises inside Gourd
      tl.to(waterLevelRef.current, { 
        scaleY: 1, 
        duration: 1.5 
      }, "<0.2"); // Start shortly after stream hits

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-neutral-50 flex items-center justify-center overflow-hidden">
      
      {/* 1. TEXT OVERLAY (Absolute positioned steps) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
        {/* We rely on the user scrolling, so we don't need complex DOM triggers for text here, 
            but usually, you'd fade these in/out based on the same timeline. 
            For simplicity, we focus on the visual animation. */}
        <h2 className="text-4xl font-bold text-[var(--color-darkgreen)] opacity-20 uppercase tracking-widest fixed top-10">
          The Ritual
        </h2>
      </div>

      {/* 2. THE STAGE (SVG) */}
      <svg 
        ref={svgRef} 
        viewBox="0 0 500 500" 
        className="w-full max-w-[500px] h-auto drop-shadow-xl"
      >
        {/* --- KETTLE GROUP --- */}
        <g ref={kettleRef} transform="translate(150, 150)">
           {/* Kettle Body */}
           <path d="M10,100 L90,100 L80,20 L20,20 Z" fill="#34495e" />
           {/* Handle */}
           <path d="M90,50 Q110,50 110,70 L110,90" fill="none" stroke="#333" strokeWidth="5" />
           {/* Spout */}
           <path d="M20,30 L-10,10" fill="none" stroke="#34495e" strokeWidth="8" />
        </g>

        {/* --- STEAM (Hidden initially) --- */}
        <g ref={steamRef} transform="translate(130, 130)">
          <path d="M10,0 Q20,-10 10,-20" stroke="#aaa" strokeWidth="3" fill="none" />
          <path d="M30,0 Q40,-10 30,-20" stroke="#aaa" strokeWidth="3" fill="none" />
          <path d="M50,0 Q60,-10 50,-20" stroke="#aaa" strokeWidth="3" fill="none" />
        </g>

        {/* --- GOURD GROUP --- */}
        <g ref={gourdRef} transform="translate(200, 300)" opacity="0">
           {/* Cup Shape */}
           <path d="M0,0 Q0,100 50,100 Q100,100 100,0 Z" fill="#5d4037" />
           
           {/* Yerba Mate (Green Fill) - Masked or simple overlay */}
           <g transform="translate(10, 10)">
              {/* This rect scales up to simulate filling */}
              <rect ref={yerbaRef} x="0" y="50" width="80" height="40" fill="#27ae60" rx="10" />
           </g>

           {/* Water Level (Blue Fill) */}
           <g transform="translate(10, 10)">
              <rect ref={waterLevelRef} x="0" y="50" width="80" height="40" fill="#3498db" rx="10" opacity="0.6" />
           </g>

           {/* Bombilla (Straw) */}
           <line x1="80" y1="10" x2="120" y2="-50" stroke="#95a5a6" strokeWidth="4" />
        </g>

        {/* --- WATER STREAM --- */}
        {/* Connects Kettle Spout area to Cup */}
        <path 
          ref={waterStreamRef} 
          d="M140,160 L250,320" 
          stroke="#3498db" 
          strokeWidth="6" 
          strokeDasharray="10,5" // Makes it look like flowing liquid
        />
      </svg>

      {/* 3. SCROLL INDICATOR */}
      <div className="absolute bottom-10 animate-bounce text-gray-400 text-sm">
        Scroll to Brew
      </div>
    </div>
  );
};

export default MatePreparation;