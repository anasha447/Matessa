import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // ✅ Import ScrollTrigger

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const useMedia = (queries, values, defaultValue) => {
  const match = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState(match);

  useEffect(() => {
    const handler = () => setValue(match);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const preloadImages = async urls => {
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

const Masonry = ({
  items = [],
  scaleOnHover = true,
  hoverScale = 0.95,
  colorShiftOnHover = false
}) => {
  // --- Responsive Columns Setup ---
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)'],
    [5, 4, 3],
    2 // Default to 2 columns for mobile
  );
  
  const isMobile = columns <= 2;
  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  // --- Preload Images ---
  useEffect(() => {
    if (items && items.length > 0) {
        preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
    }
  }, [items]);

  // --- Grid Calculation ---
  const grid = useMemo(() => {
    if (!width || !items || items.length === 0) return [];
    
    const colHeights = new Array(columns).fill(0);
    const gap = isMobile ? 10 : 20; // 10px gap on mobile, 20px on desktop
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gap);
      // Ensure height exists to prevent overlap
      const height = child.height ? (isMobile ? child.height : child.height / 2) : 200; 
      const y = colHeights[col];

      colHeights[col] += height + gap;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width, isMobile]);

  // Calculate total container height
  const containerHeight = useMemo(() => {
      if(!grid.length) return 0;
      return Math.max(...grid.map(item => item.y + item.h)) + 50;
  }, [grid]);


  // --- ANIMATION LOGIC (ScrollTrigger) ---
  useLayoutEffect(() => {
    // Wait until images are loaded and grid is calculated
    if (!imagesReady || grid.length === 0) return;

    // 1. Position items immediately (Layout)
    // We set the OUTER div to the correct X/Y position immediately.
    grid.forEach(item => {
        gsap.set(`[data-masonry-id="${item.id}"]`, { 
            x: item.x, 
            y: item.y,
            width: item.w,
            height: item.h,
            opacity: 1 // Outer container is visible, but inner content will animate
        });
    });

    // 2. Setup ScrollTrigger Batch
    // We target the OUTER div, but we animate the INNER div.
    ScrollTrigger.batch("[data-masonry-id]", {
        start: "top 90%", // Start animation when top of item hits 90% of viewport
        onEnter: batch => {
            // Find the 'inner' content wrapper for each item in this batch
            const innerElements = batch.map(el => el.querySelector(".masonry-inner"));
            
            gsap.fromTo(innerElements, 
                { 
                    y: 100,  // Slide from 100px down
                    opacity: 0, 
                    scale: 0.9 
                }, 
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1, 
                    stagger: 0.1, // Delay between items in the same row
                    duration: 0.8, 
                    ease: "power3.out",
                    overwrite: true 
                }
            );
        },
        once: true // Only animate once
    });

    // Cleanup triggers on unmount or re-render
    return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, [grid, imagesReady]);


  // --- Hover Handlers ---
  const handleMouseEnter = (id, element) => {
    if (scaleOnHover) {
      gsap.to(element.querySelector(".masonry-inner"), { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id, element) => {
    if (scaleOnHover) {
      gsap.to(element.querySelector(".masonry-inner"), { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: containerHeight > 0 ? containerHeight : '50vh' }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-masonry-id={item.id} // Used for GSAP selector
          className="absolute box-content cursor-pointer"
          onClick={() => console.log("Clicked", item.id)}
          onMouseEnter={e => handleMouseEnter(item.id, e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(item.id, e.currentTarget)}
        >
          {/* ✅ INNER DIV: This is what actually animates/slides up */}
          <div 
            className="masonry-inner relative w-full h-full bg-cover bg-center rounded-[12px] shadow-sm overflow-hidden"
            style={{ backgroundImage: `url(${item.img})` }}
          >
            {colorShiftOnHover && (
              <div className="color-overlay absolute inset-0 bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;