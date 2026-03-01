import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"; 
import md5 from "md5";
import { toast } from "react-toastify";
import { 
  FaUser, FaEnvelope, FaGlobe, FaSave, FaBoxOpen, FaTruck 
} from "react-icons/fa";
import Spinner from "../components/Spinner";

// ✅ FIXED: Removed 'getUserProfile' from imports
import { updateUserProfile, clearError } from "../redux/slices/authSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  
  // 1. Get User State
  const { user, loading, error } = useSelector((state) => state.auth);

  // Local state form (Simplified)
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    country: "India" // ✅ Default to India
  });

  // Helper for Profile Picture
  const getProfileImage = (user) => {
    // 1. Try Google Image / Uploaded Image
    if (user?.googleImage || user?.picture) return user.googleImage || user.picture;
    
    // 2. Fallback Nature Image
    return "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
  };

  // 2. Populate Form
  useEffect(() => {
    if (user) {
      // Check if user has address to get country, otherwise default
      const userAddress = (user.addresses && user.addresses.length > 0) 
        ? user.addresses[0] 
        : {};

      setFormData({
        userName: user.userName || user.username || "", 
        email: user.email || "",
        country: userAddress.country || "India"
      });
    }
    
    // Clear errors on unmount
    return () => { dispatch(clearError()); }
  }, [user, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Update
  const submitHandler = async (e) => {
    e.preventDefault();

    // We send empty strings for removed fields to ensure backend doesn't break
    // if it expects an address object structure.
    const payload = {
      userName: formData.userName,
      email: formData.email,
      addresses: [{
          country: formData.country,
          street: "",
          city: "",
          state: "",
          pincode: ""
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
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-[var(--color-darkgreen)] font-heading">My Account</h1>
            <p className="text-gray-500 mt-2">Manage your profile details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* --- LEFT SIDEBAR (Profile Card + Actions) --- */}
            <div className="md:col-span-4 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
                    <div className="bg-green-50 h-24 absolute top-0 left-0 w-full z-0"></div>
                    
                    <div className="relative z-10 inline-block">
                        <img 
                            src={getProfileImage(user)} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-md object-cover bg-white"
                        />
                        <span className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Active"></span>
                    </div>
                    
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">{formData.userName || "User"}</h2>
                    <p className="text-sm text-gray-500 mb-6">{formData.email}</p>
                    
                    {/* Roles Section Removed as requested */}
                </div>

                {/* TRACK ORDER BUTTON */}
                <Link to="/track-order" className="block w-full group">
                    <div className="bg-white hover:bg-[var(--color-orange)] hover:text-white transition-all duration-300 rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-50 text-[var(--color-orange)] group-hover:bg-white group-hover:text-[var(--color-orange)] p-3 rounded-xl transition-colors">
                                <FaBoxOpen size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-lg">Track Order</h3>
                                <p className="text-xs text-gray-400 group-hover:text-orange-100">Live Status</p>
                            </div>
                        </div>
                        <FaTruck className="text-gray-300 group-hover:text-white transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

            </div>

            {/* --- RIGHT COLUMN (Edit Form) --- */}
            <div className="md:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={submitHandler}>
                        
                        {/* Section: Basic Info */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b pb-3 border-gray-100">
                                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-3"><FaUser size={14}/></span>
                                Personal Information
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Full Name</label>
                                    <input 
                                        name="userName"
                                        type="text" 
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        value={formData.userName}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                                        <input 
                                            name="email"
                                            type="email" 
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 ml-1">Email address cannot be changed.</p>
                                </div>

                                {/* Country (Simplified Address) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Country</label>
                                    <div className="relative">
                                        <FaGlobe className="absolute left-4 top-3.5 text-gray-400" />
                                        <input 
                                            name="country"
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-pulse">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-3 transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Saving...</span>
                                ) : (
                                    <>
                                       <FaSave /> Save Changes
                                    </>
                                )}
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