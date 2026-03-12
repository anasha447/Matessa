import React from "react";
import { Helmet } from "react-helmet-async"; // ✅ 1. Import Helmet
import WorldMap from "../components/world-map";
import WhatIsMate from "../components/whatismate";
import IndianMate from "../components/indian-mate";
import MateTimeline from "../components/time-line-mate";
import QuoteParallax from "../components/quotes";
import MateRitual from "../components/mateRitual.jsx";

function ConsumptionMap () {
  // ✅ 2. SEO Configuration
  const seoTitle = "What is Yerba Mate? ";
  const seoDesc = "Explore the world of Yerba Mate. From its ancient South American roots to its growing popularity in India. Discover the timeline, rituals, and health benefits.";
  const seoUrl = "https://matessa.in/what.is.mate"; // Assuming this is your route

  // ✅ 3. Article Schema (For Educational Content)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "The Journey of Yerba Mate: From South America to India",
    "image": [
      "https://matessa.in/full.logo.webp" // Ideally replace with a hero image URL
    ],
    "author": {
      "@type": "Organization",
      "name": "Matessa India"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Matessa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://matessa.in/full.logo.webp"
      }
    },
    "description": seoDesc
  };

  return (
    <>
      <Helmet>
        {/* Visual Meta Tags */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={seoUrl} />

        {/* Social Media Tags */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={seoUrl} />

        {/* Google Schema */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

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
    </>
  );
}

export default ConsumptionMap;