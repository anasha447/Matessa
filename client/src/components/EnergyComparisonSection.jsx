import React from 'react';

const EnergyCard = ({ title, description, color, isHighlighted }) => {
  // Color configuration
  const dotColor = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-[var(--color-green)]',
  }[color] || 'bg-gray-500';

  // Highlight styling (Yerba Mate card)
  const containerClasses = isHighlighted 
    ? 'bg-[#E8F3E8] border-[var(--color-green)] shadow-lg scale-[1.02] relative z-10' 
    : 'bg-gray-50 border-transparent hover:bg-gray-100';

  const titleColor = isHighlighted ? 'text-[var(--color-darkgreen)]' : 'text-gray-800';

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${containerClasses}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm`}></span>
        <h3 className={`text-lg md:text-xl font-bold uppercase font-heading ${titleColor}`}>{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm  md:text-base font-body font-semibold">
        {description}
      </p>
    </div>
  );
};

const EnergyChart = () => {
  return (
    <div className="bg-orange-50 p-6 rounded-[2rem] h-full flex flex-col justify-center relative shadow-inner border border-green-50">
       <h3 className="text-center font-bold text-lg mb-6 text-[var(--color-darkgreen)] font-heading uppercase tracking-wide">
         Energy Over Time
       </h3>
       
      <div className="relative aspect-[4/3] w-full">
        {/* Labels */}
        <div className="absolute -left-11 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-gray-400 tracking-wider uppercase">
          Energy Level
        </div>
        <div className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 tracking-wider uppercase">
          Time (hours)
        </div>

        {/* The Chart SVG */}
        <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible drop-shadow-sm">
          {/* Grid Lines (Axes) */}
          <line x1="20" y1="280" x2="380" y2="280" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="280" x2="20" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

          {/* Coffee (Red) */}
          <path
            d="M 20 280 C 50 150, 100 50, 120 80 C 140 110, 180 250, 320 275"
            fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5"
          />
           {/* ✅ NEW POINT STYLE: White fill with Red Border */}
           <circle cx="20" cy="280" r="5" fill="white" stroke="#EF4444" strokeWidth="2.5" />
           <circle cx="120" cy="80" r="5" fill="white" stroke="#EF4444" strokeWidth="2.5" />

          {/* Tea (Yellow) */}
          <path
            d="M 20 280 C 60 220, 120 150, 160 150 C 200 150, 280 200, 350 230"
            fill="none" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" strokeDasharray="8"
          />
          {/* ✅ NEW POINT STYLE: White fill with Yellow Border */}
          <circle cx="20" cy="280" r="5" fill="white" stroke="#FACC15" strokeWidth="2.5" />
          <circle cx="160" cy="150" r="5" fill="white" stroke="#FACC15" strokeWidth="2.5" />

          {/* Yerba Mate (Green - Solid & Bold) */}
          <path
            d="M 20 280 C 50 200, 80 100, 140 100 L 260 100 C 300 100, 340 120, 380 150"
            fill="none" stroke="var(--color-green)" strokeWidth="3.5" strokeLinecap="round"
          />
           {/* ✅ NEW POINT STYLE: Solid Green fill with White Border (Distinctive) */}
           <circle cx="20" cy="280" r="6" fill="var(--color-green)" stroke="white" strokeWidth="3" />
           <circle cx="140" cy="100" r="6" fill="var(--color-green)" stroke="white" strokeWidth="3" />
        </svg>

        {/* Legend */}
        <div className="absolute top-[-20px] right-0 bg-white/80 backdrop-blur-sm p-2 rounded-lg text-xs font-bold shadow-sm border border-green-100">
           {/* Updated legend dots to match graph style */}
           <div className="flex items-center gap-1 mb-1">
             <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-green)] border border-white shadow-sm"></span> Mate
           </div>
           <div className="flex items-center gap-1 mb-1">
             <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-red-500"></span> Coffee
           </div>
           <div className="flex items-center gap-1">
             <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-yellow-400"></span> Tea
           </div>
        </div>
      </div>
    </div>
  );
};

const EnergyComparisonSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-white font-body overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-darkgreen)] mb-4 font-heading">
            Better Than Tea<br /> Smarter Than Coffee
          </h2>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          
          {/* 1. CHART (Order 1 on Mobile, Order 2 on Desktop) */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
             <EnergyChart />
          </div>

          {/* 2. TEXT CARDS (Order 2 on Mobile, Order 1 on Desktop) */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1 space-y-4">
            <EnergyCard
              title="Coffee"
              description="Quick spike followed by an energy crash within 2–3 hours. Often accompanied by jitters and anxiety."
              color="red"
            />
            <EnergyCard
              title="Tea"
              description="Gentler lift but lower energy levels. May not provide enough sustained focus for demanding tasks."
              color="yellow"
            />
            <EnergyCard
              title="Yerba Mate"
              description="Smooth, steady energy for 4–6 hours. Sharp focus with no crash and no jitters."
              color="green"
              isHighlighted={true}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default EnergyComparisonSection;