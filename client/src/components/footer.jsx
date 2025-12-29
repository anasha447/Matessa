import React, { useState } from "react";
import logo from "../assets/full.logo.png"; 
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
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
            {/* ✅ CHANGED: text color to creamy hex code [#fefae0] */}
            <a href="#" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaFacebookF size={18} />
            </a>
            <a href="#" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaTwitter size={18} />
            </a>
            <a href="#" className="text-[#fefae0] hover:text-[var(--color-orange)] transition-transform hover:-translate-y-1 p-1">
              <FaYoutube size={18} />
            </a>
        </div>
      </div>

      {/* --- Main Footer --- */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* 1. Brand Section (Always Visible) */}
          {/* ✅ CHANGED: Added 'items-center text-center' for mobile, reset with 'md:items-start md:text-left' for desktop */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4 md:col-span-1">
            <img src={logo} alt="Matessa Logo" className="w-36 md:w-40" />
            <p className="text-sm leading-relaxed text-gray-200">
              Premium Yerba Mate blends crafted with passion and nature’s finest leaves. Energize your life naturally.
            </p>
          </div>

          {/* 2. Quick Links (Accordion on Mobile) */}
          <FooterSection title="Quick Links">
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="/" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Home</a></li>
              <li><a href="/shop" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Shop</a></li>
              <li><a href="/our_story" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Our Story</a></li>
              <li><a href="/contact-us" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Contact</a></li>
            </ul>
          </FooterSection>

          {/* 3. Customer Service (Accordion on Mobile) */}
          <FooterSection title="Customer Service">
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="/faq" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">FAQs</a></li>
              <li><a href="/shipping" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Returns & Refunds</a></li>
              <li><a href="/track-order" className="hover:text-[var(--color-orange)] hover:pl-1 transition-all">Track Order</a></li>
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
                 <a href="mailto:support@matessa.com" className="hover:text-white transition-colors">support@matessa.com</a>
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
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Matessa. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;