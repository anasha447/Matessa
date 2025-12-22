import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/logo.png"; // Adjust the path as necessary

const AppFooter = () => {
  return (
    <footer className="bg-[var(--color-darkgreen)] text-white font-body">
      {/* Social Bar */}
      <div className="flex justify-center gap-6 py-4 bg-[var(--color-green)]">
        <a
          href="#"
          className="hover:text-[var(--color-orange)] transition-colors"
        >
          <FaFacebookF size={20} />
        </a>
        <a
          href="#"
          className="hover:text-[var(--color-orange)] transition-colors"
        >
          <FaInstagram size={20} />
        </a>
        <a
          href="#"
          className="hover:text-[var(--color-orange)] transition-colors"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="#"
          className="hover:text-[var(--color-orange)] transition-colors"
        >
          <FaYoutube size={20} />
        </a>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo */}
        <div>
          <img src={logo} alt="Matessa Logo" className="w-40 mb-4" />
          <p className="text-sm">
            Premium Yerba Mate blends crafted with passion and nature’s finest
            leaves.
          </p>
        </div>

        {/* Column 1 */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-[var(--color-yellow)] font-heading">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Shop
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-[var(--color-yellow)] font-heading">
            Customer Service
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Returns & Refunds
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[var(--color-orange)]">
                Track Order
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-lg font-semibold mb-3 text-[var(--color-yellow)] font-heading">
            Contact Us
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Email: support@matessa.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Location: Mumbai, India</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--color-green)] text-center py-4 text-sm">
        © {new Date().getFullYear()} Matessa. All rights reserved.
      </div>
    </footer>
  );
};

export default AppFooter;
