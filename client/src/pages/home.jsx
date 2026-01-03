// src/pages/Home.jsx
import React from "react";
import Banner from "../components/banner";
import FeaturedProducts from "../components/featured_products";
import ScrollingBar from "../components/scrolling_bar"; // Import your scrolling bar component
import YerbaMateBenefits from "../components/key-health"; // Import the benefits component
import CustomerReviews from "../components/review"; // Import the customer reviews component
import DomeGallery from "../components/demoGallery";
import QuoteParallax from "../components/quotes.jsx";
import AfterBanner from "../components/afterBanner";
import MatessaJourney from "../components/MatessaJourney.jsx";

const Home = () => {
  return (
    <div className="bg-white min-h-screen">
      <Banner />
      <ScrollingBar />
      <AfterBanner />
      <FeaturedProducts />
      <YerbaMateBenefits /> {/* Add the benefits section here */}
<div style={{ width: '100vw', height: '80vh',    backgroundImage: "linear-gradient(to bottom, #F9F7F3, #f2f2f2)"
 }}>
<h2 className="font-heading text-green text-3xl text-center mb-8 font-bold bg-white">
  Who Drinks Mate
</h2>      <DomeGallery />
    </div>
    <CustomerReviews/> 
    <QuoteParallax/>
   </div>
  );
};

export default Home;
