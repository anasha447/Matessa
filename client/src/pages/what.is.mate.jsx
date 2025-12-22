import React from "react";
import WorldMap from "../components/world-map";
import WhatIsMate from "../components/whatismate";
import IndianMate from "../components/indian-mate";
import MateTimeline from "../components/time-line-mate";
import QuoteParallax from "../components/quotes";
import MateRitual from "../components/mateRitual.jsx";

function ConsumptionMap () {
  return (
    <div className="bg-white min-h-screen">
<WhatIsMate />
      <MateTimeline />

      <h1 className="text-center font-heading text-black text-xl md:text-3xl font-bold py-1">
  Yerba Mate Consumption Map
</h1>
      <WorldMap />
      <IndianMate/>
      <MateRitual/>
      <QuoteParallax/>
    </div>
  );
}

export default ConsumptionMap;
