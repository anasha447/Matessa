import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaLock, FaCookieBite, FaUserSecret } from "react-icons/fa";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white font-body text-gray-700">
      
      {/* Header Banner */}
      <div className="bg-[var(--color-darkgreen)] py-16 px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl font-heading font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          At Matessa, we value your trust. Here is how we protect and manage your data.
        </p>
        <p className="text-sm mt-4 opacity-75">Last Updated: December 2025</p>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">1. Introduction</h2>
          <p className="leading-relaxed">
            Welcome to <strong>Matessa</strong>. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <a href="mailto:support@matessa.com" className="text-green-600 hover:underline">support@matessa.com</a>.
          </p>
        </section>

        {/* Information Collection */}
        <section className="grid md:grid-cols-[50px_1fr] gap-4">
          <FaUserSecret className="text-3xl text-[var(--color-orange)] mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">2. Information We Collect</h2>
            <p className="mb-4">
              We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, when you participate in activities on the website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise contacting us.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and shipping address.</li>
              <li><strong>Payment Data:</strong> We do not store credit card details. All payment data is stored by our payment processor (e.g., Stripe, PayPal).</li>
              <li><strong>Credentials:</strong> Passwords and security information used for authentication and account access.</li>
            </ul>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="grid md:grid-cols-[50px_1fr] gap-4">
          <FaShieldAlt className="text-3xl text-[var(--color-darkgreen)] mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To send administrative information to you (e.g., product updates, shipping status).</li>
              <li>To protect our services (fraud monitoring and prevention).</li>
            </ul>
          </div>
        </section>

        {/* Cookies */}
        <section className="grid md:grid-cols-[50px_1fr] gap-4">
          <FaCookieBite className="text-3xl text-yellow-500 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">4. Cookie Policy</h2>
            <p>
              We use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="grid md:grid-cols-[50px_1fr] gap-4">
          <FaLock className="text-3xl text-blue-600 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">5. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our website is at your own risk.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Have Questions?</h2>
          <p className="mb-6">
            If you have questions or comments about this policy, you may email us at <br/>
            <span className="font-bold">support@matessa.com</span>
          </p>
          <Link 
            to="/contact-us" 
            className="inline-block bg-[var(--color-orange)] text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Contact Us
          </Link>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;