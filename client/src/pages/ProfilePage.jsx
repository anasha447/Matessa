import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import md5 from "md5";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaSave } from "react-icons/fa";
import Spinner from "../components/Spinner";

// ✅ Import Redux Action
import { updateUserProfile, clearError } from "../redux/slices/authSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  
  // 1. Get User State
  const { user, loading, error } = useSelector((state) => state.auth);

  // Local state form
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    street: "",
    city: "",
    pincode: "",
    country: ""
  });

  // Helper for Gravatar
  const getGravatarURL = (email) => {
    if (!email) return "https://via.placeholder.com/150";
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  };

  // 2. Populate Form
  useEffect(() => {
    if (user) {
      // Check if user has addresses
      const userAddress = (user.addresses && user.addresses.length > 0) 
        ? user.addresses[0] 
        : {};

      setFormData({
        userName: user.userName || user.username || "", // Handle casing differences
        email: user.email || "",
        street: userAddress.street || "",
        city: userAddress.city || "",
        pincode: userAddress.pincode || userAddress.postalCode || "",
        country: userAddress.country || ""
      });
    }
    
    // Clear errors on mount/unmount
    return () => { dispatch(clearError()); }
  }, [user, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Update
  const submitHandler = async (e) => {
    e.preventDefault();

    // Construct Payload for Backend
    // Adjust structure based on what your User Controller expects
    const payload = {
      userName: formData.userName,
      email: formData.email,
      // Sending address as a nested object or list depending on backend expectation
      addresses: [{
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          country: formData.country
      }]
    };

    const result = await dispatch(updateUserProfile(payload));

    if (updateUserProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.payload || "Update failed");
    }
  };

  if (loading && !user) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-[var(--color-darkgreen)] font-heading">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and shipping details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Quick Info */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                    <div className="relative inline-block">
                        <img 
                            src={getGravatarURL(formData.email)} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full mx-auto border-4 border-green-50 shadow-md"
                        />
                        <span className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></span>
                    </div>
                    
                    <h2 className="mt-4 text-xl font-bold text-gray-800">{formData.userName}</h2>
                    <p className="text-sm text-gray-500 mb-4">{formData.email}</p>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                         {user?.roles?.map((role, index) => (
                             <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                 {typeof role === 'string' ? role.replace('ROLE_', '') : role.roleName?.replace('ROLE_', '')}
                             </span>
                         ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={submitHandler}>
                        
                        {/* Section 1: Basic Info */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                                <FaUser className="mr-2 text-[var(--color-orange)]" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        name="userName"
                                        type="text" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        value={formData.userName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                        <input 
                                            name="email"
                                            type="email" 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                                <FaMapMarkerAlt className="mr-2 text-[var(--color-orange)]" /> Shipping Address
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                                    <input 
                                        name="street"
                                        type="text" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        value={formData.street}
                                        onChange={handleChange}
                                        placeholder="123 Main St"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                    <div className="relative">
                                        <FaCity className="absolute left-3 top-3 text-gray-400" />
                                        <input 
                                            name="city"
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Postal / Zip Code</label>
                                    <input 
                                        name="pincode"
                                        type="text" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                                    <div className="relative">
                                        <FaGlobe className="absolute left-3 top-3 text-gray-400" />
                                        <input 
                                            name="country"
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;