import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import api from "../apis/axiosConfig"; // Ensure you have your Axios config here

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calls Backend API: POST /api/public/contact
      await api.post("/public/contact", formData);
      
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3] py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-heading font-bold text-[var(--color-darkgreen)] mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our Yerba Mate blends? Need help with an order? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Left Side: Contact Info */}
          <div className="bg-[var(--color-darkgreen)] p-10 text-white flex flex-col justify-center">
            <h3 className="text-2xl font-heading font-semibold mb-6 text-[var(--color-yellow)]">
              Contact Information
            </h3>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-green)] p-3 rounded-full">
                  <FaPhoneAlt className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-yellow)]">Phone</p>
                  <p className="text-gray-200">+91 7984191716</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-green)] p-3 rounded-full">
                  <FaEnvelope className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-yellow)]">Email</p>
                  <p className="text-gray-200">support@matessa.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[var(--color-green)] p-3 rounded-full">
                  <FaMapMarkerAlt className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-yellow)]">Location</p>
                  <p className="text-gray-200">Lucknow, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: The Form */}
          <div className="p-10">
            <h3 className="text-2xl font-heading font-bold text-gray-800 mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent outline-none transition-all"
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-orange)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;