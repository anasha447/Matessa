import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// ✅ Ensure this matches your file name exactly (lowercase 'c' is standard)
import { fetchCoupons, createCoupon, deleteCoupon } from "../../redux/slices/CouponSlice";
import { FaTrash, FaTag, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

const AdminCoupons = () => {
  const dispatch = useDispatch();

  // 1. Get State from Redux
  // We use a safe check (|| {}) to prevent crashes if the store is empty
  const { coupons = [], loading } = useSelector((state) => state.coupons || {});

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: ""
  });

  // 2. Load Data on Page Mount
  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Debugging: Check if coupons are loading
  useEffect(() => {
     console.log("Current Coupons in Redux:", coupons);
  }, [coupons]);

  // 3. Handle Create
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPercentage) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      // Step A: Create the coupon
      await dispatch(createCoupon({
        code: formData.code.toUpperCase(), 
        discountPercentage: parseFloat(formData.discountPercentage)
      })).unwrap();
      
      toast.success("Coupon Created Successfully!");
      setFormData({ code: "", discountPercentage: "" }); // Reset form

      // ✅ FIX: Force refresh the list immediately to show the new item
      dispatch(fetchCoupons());

    } catch (err) {
      toast.error(err || "Failed to create coupon");
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      try {
        await dispatch(deleteCoupon(id)).unwrap();
        toast.success("Coupon Deleted");
        // ✅ FIX: Force refresh list after delete too
        dispatch(fetchCoupons()); 
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  if (loading && (!coupons || coupons.length === 0)) return <Spinner />;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-body">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-heading font-bold text-[var(--color-darkgreen)] mb-8 flex items-center gap-3">
          <FaTag /> Coupon Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* --- LEFT: CREATE FORM --- */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Create New Coupon</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-green)] outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--color-green)] outline-none"
                    min="1" max="100"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-orange)] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaPlus size={14} /> 
                  {loading ? "Saving..." : "Create Coupon"}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: COUPON LIST --- */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons && coupons.length > 0 ? (
                    coupons.map((coupon) => (
                      <tr key={coupon.couponId || Math.random()} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-[var(--color-darkgreen)] font-mono text-lg">
                          {coupon.code}
                        </td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {coupon.discountPercentage}% OFF
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(coupon.couponId)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-400">
                        {loading ? "Loading coupons..." : "No coupons active. Create one!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;