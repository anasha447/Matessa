// src/components/LocalConsumptionMap.jsx
import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import LocalMap from "../data/countries-110m.json";

/* Data (Kept same as your code) */
const countryData = {
  ARG: { value: 199, story: "Mate is the national drink of Argentina." },
  BRA: { value: 120, story: "Brazil enjoys chimarrão." },
  URY: { value: 190, story: "Uruguay has one of the highest per-capita consumptions." },
  PRY: { value: 160, story: "Paraguay drinks tereré in summer." },
  SYR: { value: 150, story: "Imported by immigrant communities, now part of Syrian tea culture." },
  BOL: { value: 180, story: "Bolivia drinks mate for both culture and health." },
  CHL: { value: 150, story: "Chile has a strong mate culture." },
  USA: { value: 30, story: "Mate is trendy in US wellness circles." },
  ESP: { value: 60, story: "Spain is the largest importer in Europe." },
  ITA: { value: 30, story: "Mate is imported for health-conscious consumers." },
  DEU: { value: 50, story: "Germany has a growing interest in mate." },
  ARE: { value: 40, story: "United Arab Emirates enjoys mate as a trendy beverage." },
  COL: { value: 60, story: "Colombia has a small but growing mate market." },
  LBN: { value: 100, story: "Lebanon has a unique blend of mate with local herbs." },
  GBR: { value: 25, story: "In the UK, mate is niche but growing among herbal tea enthusiasts." },
  IND: { value: 15, story: "India is discovering Yerba Mate as a healthy with the magic of spices as alternative to tea and coffee.", color: "#F26323" },
};

/* Mappings (Kept same) */
const idToISO = {
  "032": "ARG", "068": "BOL", "076": "BRA", "152": "CHL", "600": "PRY",
  "760": "SYR", "858": "URY", "840": "USA", "724": "ESP", "380": "ITA",
  "276": "DEU", "784": "ARE", "170": "COL", "422": "LBN", "356": "IND",
  "826": "GBR"
};

const iso3To2 = {
  ARG: "ar", BRA: "br", URY: "uy", PRY: "py", SYR: "sy", BOL: "bo",
  CHL: "cl", USA: "us", ESP: "es", ITA: "it", DEU: "de", ARE: "ae",
  COL: "co", LBN: "lb", IND: "in", GBR: "gb"
};

const colorScale = scaleLinear()
  .domain([0, 200])
  .range(["#7A9D3E", "#2F3B28"]);

function getTooltipPosition(x, y, maxW = 300, maxH = 200, offset = 15) {
  let left = x + offset;
  let top = y + offset;
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  if (left + maxW > ww) left = x - offset - maxW;
  if (top + maxH > wh) top = y - offset - maxH;
  return { left: Math.max(8, left), top: Math.max(8, top) };
}

export default function LocalConsumptionMap() {
  const [tooltip, setTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // 1. Track Mobile State

  const [viewConfig, setViewConfig] = useState({
    scale: 200,
    center: [0, 0]
  });

  // 2. Handle Resize for Config AND isMobile check
  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck);

      if (mobileCheck) {
        setViewConfig({ scale: 180, center: [0, -5] });
      } else {
        setViewConfig({ scale: 120, center: [0, -20] });
      }
    };

    handleResize(); // Init on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Global Click Listener (Closes tooltip when clicking background)
  useEffect(() => {
    const handleGlobalClick = () => {
      if (tooltip) setTooltip(null);
    };

    // Attach listener only if tooltip exists (optimization)
    if (tooltip) {
      window.addEventListener("click", handleGlobalClick);
    }

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [tooltip]);

  const getCountryColor = (isoOrId) => {
    const iso = idToISO[isoOrId] || isoOrId;
    const data = countryData[iso];
    if (data?.color) return data.color;
    return data && data.value !== null ? colorScale(data.value) : "#F3EAD0";
  };

  const handleInteraction = (evt, geo) => {
    const rawId = geo.properties?.ISO_A3 || geo.properties?.iso_a3 || geo.id;
    const iso = idToISO[rawId] || rawId;
    const name = geo.properties?.name || "Unknown";
    const data = countryData[iso];
    const flagCode = iso3To2[iso];

    setTooltip({
      name,
      story: data?.story ?? null,
      flagUrl: flagCode ? `https://flagcdn.com/w40/${flagCode}.webp` : null,
      x: evt.clientX,
      y: evt.clientY,
    });
  };

  // 4. Mobile Specific Click Handler
  const handleMobileClick = (evt, geo) => {
    // STOP PROPAGATION: This prevents the 'window' click listener from running immediately
    evt.stopPropagation();
    handleInteraction(evt, geo);
  };

  const handleMove = (evt) => {
    setTooltip((prev) => (prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev));
  };

  const handleLeave = () => setTooltip(null);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Tooltip */}
      {tooltip && (() => {
        const { left, top } = getTooltipPosition(tooltip.x, tooltip.y);
        return (
          <div
            className="fixed z-50 bg-[#F9F7F3] text-gray-900 rounded-lg shadow-xl border border-gray-200 p-3 pointer-events-none"
            style={{ left, top, fontSize: 13, maxWidth: 280 }}
          >
            <div className="flex items-center gap-2 mb-1">
              {tooltip.flagUrl && (
                <img src={tooltip.flagUrl} alt="flag" className="w-6 h-4 rounded-sm object-cover shadow-sm" />
              )}
              <strong className="text-sm font-bold">{tooltip.name}</strong>
            </div>
            {tooltip.story && <p className="text-gray-700 leading-snug mt-1">{tooltip.story}</p>}
          </div>
        );
      })()}

      <ComposableMap
        projectionConfig={viewConfig}
        style={{ width: "100%", height: "100%" }}
        className="w-full h-[500px] md:h-[600px] transition-all duration-500 ease-in-out"
      >
        <Geographies geography={LocalMap}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const rawId = geo.properties?.ISO_A3 || geo.properties?.iso_a3 || geo.id;
              const color = getCountryColor(rawId);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  
                  // 5. Conditional Event Handlers
                  // PC Only: Hover Logic
                  onMouseEnter={(e) => {
                    if (!isMobile) handleInteraction(e, geo);
                  }}
                  onMouseMove={(e) => {
                    if (!isMobile) handleMove(e);
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) handleLeave();
                  }}

                  // Mobile Only: Click Logic
                  onClick={(e) => {
                    if (isMobile) handleMobileClick(e, geo);
                  }}

                  style={{
                    default: { fill: color, stroke: "#FFF", strokeWidth: 0.5, outline: "none", transition: "all 0.3s ease" },
                    hover: { fill: "#EADBA2", stroke: "#FFF", strokeWidth: 1, outline: "none", cursor: "pointer" },
                    pressed: { fill: "#EADBA2", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}