import React, { useState } from "react";
import { Link } from "react-router-dom"; // ✅ FIXED: Added missing import
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/full.logo.webp"; 
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope
} from "react-icons/fa";

// --- Helper Component for Mobile Accordions ---
const FooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-green)] md:border-none last:border-none w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-4 md:py-0 md:mb-4 text-left group"
      >
        <h4 className="text-lg font-semibold text-[var(--color-yellow)] font-heading group-hover:text-[var(--color-orange)] transition-colors">
          {title}
        </h4>
        {/* Icon only visible on Mobile */}
        <span className="md:hidden text-[var(--color-yellow)]">
          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </span>
      </button>
      
      {/* Content: Hidden on mobile unless open, Always visible on Desktop */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100 md:mb-0'}`}>
        {children}
      </div>
    </div>
  );
};

const AppFooter = () => {
  return (
    <footer className="bg-[var(--color-darkgreen)] text-white font-body">
      
      {/* --- Social Bar --- */}
      <div className="bg-[var(--color-green)]">
        <div className="max-w-7xl mx-auto flex justify-center gap-8 py-3 px-6">
            <a href="https://www.facebook.com/profile.php?id=61586346984878" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaFacebookF size={18} />
            </a>
            <a href="https://www.instagram.com/matessa.in?igsh=MTZpNXluZDI5c3hrcA==" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaInstagram size={18} />
            </a>
        </div>
      </div>

      {/* --- Main Footer --- */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* 1. Brand Section (Always Visible) */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4 md:col-span-1 relative">
    
            {/* 1. Invisible Image: Keeps the width/height correct in the layout */}
            <img src={logo} alt="Matessa Logo" className="w-36 md:w-40 opacity-0 pointer-events-none" />

            {/* 2. Color Overlay Layer */}
            <div 
                className="absolute inset-0 w-full h-full bg-[var(--color-yellow)]"
                style={{
                    maskImage: `url(${logo})`,
                    WebkitMaskImage: `url(${logo})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center'
                }}
            />
          </div>

          {/* 2. Quick Links (Accordion on Mobile) */}
          <FooterSection title="Quick Links">
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Home</Link></li>
              <li><Link to="/shop" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Shop</Link></li>
              <li><Link to="/our_story" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Our Story</Link></li>
              <li><Link to="/contact-us" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Contact</Link></li>
            </ul>
            {/* ✅ FIXED: Removed stray 's' here */}
          </FooterSection>

          {/* 3. Customer Service (Accordion on Mobile) */}
          <FooterSection title="Customer Service">
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/privacy-policy" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Privacy Policy</Link></li>
              <li><Link to="/track-order" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Track Order</Link></li>
            </ul>
          </FooterSection>

          {/* 4. Contact Us (Always Visible for Utility) */}
          <div className="mt-4 md:mt-0">
             <h4 className="text-lg font-semibold mb-4 text-[var(--color-yellow)] font-heading">
                Contact Us
             </h4>
             <ul className="space-y-4 text-sm text-gray-300">
               <li className="flex items-start gap-3">
                 <FaEnvelope className="text-[var(--color-orange)] mt-1 flex-shrink-0" />
                 <a href="mailto:support@matessa.com" className="hover:text-white transition-colors">support@matessa.in</a>
               </li>
               <li className="flex items-start gap-3">
                 <FaPhoneAlt className="text-[var(--color-orange)] mt-1 flex-shrink-0" />
                 <a href="tel:+917984191716" className="hover:text-white transition-colors">+91 7984191716</a>
               </li>
               <li className="flex items-start gap-3">
                 <FaMapMarkerAlt className="text-[var(--color-orange)] mt-1 flex-shrink-0" />
                 <span>Lucknow, India</span>
               </li>
             </ul>
          </div>

        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="border-t border-[var(--color-green)]/30 bg-black/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Matessa. All rights reserved.</p>
        </div>
      </div>

    </footer>
  );
};

export default AppFooter;