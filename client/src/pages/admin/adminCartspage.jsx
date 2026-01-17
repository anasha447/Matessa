import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCarts } from "../../redux/slices/cartSlice";
import { FaShoppingCart, FaSearch, FaUser, FaBoxOpen, FaMoneyBillWave } from "react-icons/fa";
import Spinner from "../../components/Spinner";

const AdminCartsPage = () => {
  const dispatch = useDispatch();
 const { adminCarts = [], loading, error } = useSelector((state) => state.cart);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllCarts());
  }, [dispatch]);

  // Filter logic (Search by Cart ID or User Email if available)
  const filteredCarts = adminCarts.filter((cart) => 
    cart.cartId?.toString().includes(searchTerm) || 
    (cart.user?.email && cart.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-800 flex items-center gap-3">
            <FaShoppingCart className="text-[var(--color-darkgreen)]" /> Active Carts Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor all active shopping sessions.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-auto">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ID or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Carts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <th className="px-6 py-4">Cart ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4">Products Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCarts.length > 0 ? (
                filteredCarts.map((cart) => (
                  <tr key={cart.cartId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      #{cart.cartId}
                    </td>
                    <td className="px-6 py-4">
                      {cart.user ? (
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                               <FaUser />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-gray-800">{cart.user.username || "User"}</p>
                               <p className="text-xs text-gray-500">{cart.user.email}</p>
                            </div>
                         </div>
                      ) : (
                         <span className="text-sm text-gray-400 italic">Guest / Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                        <FaBoxOpen /> {cart.products?.length || 0} Items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[var(--color-darkgreen)] font-bold">
                        <FaMoneyBillWave /> ₹{cart.totalPrice?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex -space-x-2 overflow-hidden">
                          {(cart.products || []).slice(0, 4).map((p, idx) => (
                             <img 
                               key={idx}
                               src={p.image ? `https://matessa.in/images/${p.image}` : "https://via.placeholder.com/40"} 
                               alt="Product"
                               className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100"
                               title={p.productName}
                             />
                          ))}
                          {(cart.products?.length || 0) > 4 && (
                             <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs font-bold text-gray-600">
                                +{(cart.products.length - 4)}
                             </div>
                          )}
                          {(cart.products?.length || 0) === 0 && (
                             <span className="text-xs text-gray-400">Empty</span>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                       <FaShoppingCart size={40} className="opacity-20" />
                       <p>No active carts found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCartsPage;