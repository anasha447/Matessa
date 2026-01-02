import React from 'react';
import Masonry from './Masonry'; // Import the engine

// Images
import img1 from '../assets/g2.jpg';
import img2 from '../assets/matecup.jpg';
import img3 from '../assets/g1.jpg';
import img9 from '../assets/g5.jpg';

import img4 from '../assets/mate-cup.jpg';
import img5 from '../assets/GALL1.jpg';
import img6 from '../assets/GALL3.jpg';
import img7 from '../assets/GALL4.jpg';
import img8 from '../assets/GALL5.png';
import img10 from '../assets/matee5.jpg';


// Data Configuration
const items = [
    { id: "1", img: img1, height: 400 },
    { id: "2", img: img2, height: 600 },
    { id: "3", img: img3, height: 400 },
    { id: "4", img: img4, height: 300 },
    { id: "5", img: img5, height: 350 },
    { id: "6", img: img6, height: 500 },
    { id: "7", img: img7, height: 320 },
    { id: "8", img: img8, height: 420 },
    { id: "9", img: img9, height: 400 },
    { id: "10", img: img10, height: 500 },
];

// ✅ THE COMPONENT FUNCTION
const MasonryUsage = () => {
  return (
    <div className="w-full min-h-[600px] p-4"> {/* Added height container */}
      <Masonry
        items={items}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={true}
        hoverScale={0.95}
        blurToFocus={true}
        colorShiftOnHover={false}
      />
    </div>
  );
};

// 🚨 THIS IS WHAT WAS MISSING:
export default MasonryUsage;