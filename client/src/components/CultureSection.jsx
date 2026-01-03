import React from 'react';
// ✅ Local Video Import
import cultureVideo from '../assets/videos/culture.mp4'; 

const CultureSection = () => {
  return (
    <section className="py-12 px-4 md:px-8 bg-white">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Container: Rounded corners, Green BG */}
        <div className="flex flex-col lg:flex-row bg-[var(--color-darkgreen)] rounded-3xl overflow-hidden shadow-lg min-h-[500px]">
          
          {/* --- LEFT SECTION: TEXT --- */}
          <div className="w-full lg:w-1/4 p-8 md:p-12  flex flex-col justify-center bg-[var(--color-darkgreen)] relative z-10">
            
            <h2 className="text-2xl md:text-4xl font-heading font-bold  text-center mb-6 leading-tight text-[#f8c92d]">
              GOOD THINGS ARE GROWING IN THE SHADE
            </h2>
            
            <p className="text-lg leading-relaxed font-body text-yellow opacity-90 text-center">
              Long before energy drinks, there was Mate. 
              For centuries, this has been Latin America's daily natural fuel, yet it remains a secret here in Asia. 
              Be the first to discover the forest’s ancient answer to lasting energy and focus.
            </p>

          </div>

          {/* --- RIGHT SECTION: VIDEO --- */}
          <div className="w-full lg:w-3/4 relative h-[500px]  lg:h-auto bg-black">
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              autoPlay
              loop
              muted
              playsInline
              src={cultureVideo} 
            />
            {/* Overlay to blend video with green theme */}
            <div className="absolute inset-0 bg-[var(--color-darkgreen)]/10 mix-blend-multiply pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CultureSection;