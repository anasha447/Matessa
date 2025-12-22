import React from "react";
import OurStoryBanner from "../components/banner-ourstory";
import Matecup from "../assets/matecupp.jpg";
import Masala from "../assets/masala1.jpg";
import branding from "../assets/branding.png";

import StorySection from "../components/ourstory/StorySection";

const sections = [
  {
    id: 1,
    title: "The Mate Tradition",
    text: "Mate was more than a drink, it's a daily ritual of connection with family and friends. This South American tradition, the native people call it drink of the gods, provides legendary clean energy. For centuries, Mate has been an ancient symbol of community and vitality, bringing people closer with every shared cup.",
    image: Matecup,
  },
  {
    id: 2,
    title: "The Beginning ",
    text: "In my early twenties, traveling through India, I got impressed in the vibrant tradition of the magic Indian herbs. I realized these flavors were the perfect partner for the raw, powerful energy of South American Mate. It was time to bridge these two distinct worlds.",
    image: Masala,
  },
  {
    id: 3,
    title: "The Birth of Mateesa",
    text: "MaTeesa was inspired by the magic of Indian herbs, creating a unique harmony with South American yerba mate, Matessa is not just a drink , it's a bridge connecting nature, cultures, and communities.",
    image: branding,
  },
  
];

const StoryJourney = () => {
  return (
    <div className="bg-white min-h-screen">
      <OurStoryBanner />
    
        <div className="space-y-32 py-15 px-11">
          {sections.map((section, index) => (
            <StorySection key={section.id} section={section} index={index} />
          ))}
        </div>
      
    </div>
  );
};

export default StoryJourney;
