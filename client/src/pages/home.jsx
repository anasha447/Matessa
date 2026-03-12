// src/pages/Home.jsx
import React from "react";
import { Helmet } from "react-helmet-async"; // ✅ 1. Import this for SEO
import Banner from "../components/banner";
import FeaturedProducts from "../components/featured_products";
import ScrollingBar from "../components/scrolling_bar";
import YerbaMateBenefits from "../components/key-health";
import CustomerReviews from "../components/review";
import DomeGallery from "../components/demoGallery";
import QuoteParallax from "../components/quotes.jsx";
import AfterBanner from "../components/afterBanner";
import EnergyComparisonSection from '../components/EnergyComparisonSection';
// Removed MatessaJourney since it wasn't used in your JSX, add it back if needed

const Home = () => {
  return (
    <>
      <Helmet>
        {/* ✅ 2. The Big Blue Link on Google */}
        <title>Matessa - Premium Yerba Mate</title>
        
        {/* ✅ 3. The Description below the link */}
        <meta name="description" content="Discover authentic Yerba Mate from South America. Shop our premium loose leaf blends, traditional gourds, and bombillas for a natural energy boost in India." />
        
        {/* ✅ 4. Organization Schema (The 'Matero' Style Brand Card) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Matessa",
              "url": "https://matessa.in",
              "logo": "https://matessa.in/full.logo.webp",
              "sameAs": [
                "https://www.instagram.com/matessa.in", 
                "https://www.facebook.com/matessa.in"
              ]
            }
          `}
        </script>
      </Helmet>

      <div className="bg-white min-h-screen">
        <Banner />
        <ScrollingBar />
        <AfterBanner />
        <FeaturedProducts />
        <EnergyComparisonSection/>
        <YerbaMateBenefits />
        
        <div style={{ width: '100vw', height: '80vh', backgroundImage: "linear-gradient(to bottom, #F9F7F3, #f2f2f2)" }}>
          <h2 className="font-heading text-green text-3xl text-center mb-8 font-bold bg-white pt-8">
            Who Drinks Mate
          </h2>
          <DomeGallery />
        </div>

        <CustomerReviews />
        <QuoteParallax />
      </div>
    </>
  );
};

export default Home;