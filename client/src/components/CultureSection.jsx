import React from 'react';
// ✅ Local Video Import
import cultureVideo from '../assets/videos/culture.mp4'; 

const CultureSection = () => {
  return (
    <section className="w-full py-5 bg-darkgreen"> 
      {/* px-4 ensures the rounded corners don't touch the screen edge. 
         Change to px-0 if you want the green box to be a perfect rectangle 
      */}
      <div className="w-full px-4 md:px-8">
        
        {/* Main Card */}
        <div className="flex flex-col lg:flex-row bg-[var(--color-darkgreen)] rounded-[2rem] overflow-hidden shadow-xl min-h-[550px]">
          
          {/* --- LEFT SECTION: TEXT --- */}
          <div className="w-full lg:w-2/5 p-8 md:p-16 flex flex-col justify-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 leading-tight text-[#f8c92d]">
              GOOD THINGS ARE <br/> GROWING IN <br/> THE SHADE
            </h2>
            
            <p className="text-lg leading-relaxed font-body text-white opacity-90">
              Long before energy drinks, there was Mate.  
              For centuries, this has been a daily natural fuel for the Latin Nations, yet it remains a secret here in Asia. 
              Be the first to discover the forest’s ancient answer to lasting energy and focus.
            </p>
          </div>

          {/* --- RIGHT SECTION: VIDEO --- */}
          <div className="w-full lg:w-3/5 relative h-[400px] lg:h-auto bg-black">
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              autoPlay
              loop
              muted
              playsInline
              src={cultureVideo} 
            />
            <div className="absolute inset-0 bg-[var(--color-darkgreen)]/20 mix-blend-multiply pointer-events-none"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CultureSection;