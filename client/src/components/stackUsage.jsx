// src/components/StackGallery.jsx
import React from 'react';
import Stack from './stackGallery.jsx' // Importing the logic file

// --- Import Images ---
import img1 from '../assets/matee4.jpg';
import img2 from '../assets/GALL3.jpg';
import img3 from '../assets/GALL5.png';
import img4 from '../assets/matee3.jpg';
import img5 from '../assets/matee5.jpg';


const StackGallery = () => {
  // Map images to elements
  const images = [img1, img2, img3, img4, img5].map((src, i) => (
    <img 
      key={i} 
      src={src} 
      alt={`Mate Cup ${i + 1}`} 
      className="w-full h-full object-cover pointer-events-none" 
    />
  ));

  return (
    <div className="flex flex-col items-center justify-center py-1 bg-[#f9f7f300]">
      
      {/* Optional Title */}
      
      {/* The Stack Container */}
      {/* Control the size of the cards using this div's width/height */}
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <Stack
          randomRotation={true}
          sensitivity={180}
          sendToBackOnClick={true}
          cards={images}
          animationConfig={{ stiffness: 200, damping: 20 }}
        />
      </div>
      
      <p className="mt-8 text-sm text-gray-900 uppercase tracking-widest animate-pulse">
        Click or Drag to Shuffle
      </p>
    </div>
  );
};

export default StackGallery;