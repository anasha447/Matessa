import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaTags, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Imports
import { fetchAllProducts, deleteProduct } from "../../redux/slices/productSlice"; 
import { fetchCategories } from "../../redux/slices/categorySlice"; 

// ✅ FIX 1: Use Live URL (Change to localhost only for dev)
const API_BASE_URL = "https://matessa.in";

const ProductListPage = () => {
  const dispatch = useDispatch();

  // Local State for Client-side Search
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Get State
  // Default to empty array [] to prevent .map crashes
  const { items: products = [], loading, error } = useSelector((state) => state.products);
  const { items: categories = [] } = useSelector((state) => state.categories);

  // 2. Fetch Data on Mount
  useEffect(() => {
      // Fetch Products (Only if empty to save bandwidth, or always if you prefer fresh data)
      dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 100 }));
      dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id)).unwrap(); 
        toast.success("Product deleted successfully");
        // ❌ REMOVED: dispatch(fetchAllProducts...) 
        // Reason: Your slice already filters it out. No need to re-fetch!
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  // ✅ HELPER: Category Name Lookup
  const getCategoryName = (product) => {
      if (product.category && product.category.categoryName) return product.category.categoryName;
      if (product.categoryId && categories.length > 0) {
          // Double equals (==) handles string vs number ID mismatches
          const found = categories.find(cat => cat.categoryId == product.categoryId);
          if (found) return found.categoryName;
      }
      return "Uncategorized";
  };

  // ✅ HELPER: Image URL Builder
  const getImageUrl = (imageName) => {
      if (!imageName || imageName === "default.png") return null;
      if (imageName.startsWith("http")) return imageName;
      return `${API_BASE_URL}/api/public/images/${imageName}`;
  };

  // ✅ FILTER: Client-side Search Logic
  const filteredProducts = products.filter(product => 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto py-12 px-4 md:px-12 bg-gray-50 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] font-heading">
            Product Management
            </h1>
            <p className="text-gray-500 mt-1">Manage inventory, prices, and images</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
            {/* Search Bar */}
            <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search product..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[var(--color-orange)]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Link to="/admin/categories" className="bg-white border-2 border-[var(--color-orange)] text-[var(--color-orange)] py-2 px-5 rounded-full flex items-center gap-2 hover:bg-orange-50 font-bold transition-colors shadow-sm whitespace-nowrap">
              <FaTags /> Categories
            </Link>
            <Link to="/admin/product/create" className="bg-[var(--color-orange)] text-white py-2 px-5 rounded-full flex items-center gap-2 hover:opacity-90 shadow-md font-bold transition-transform active:scale-95 whitespace-nowrap">
              <FaPlus /> Add Product
            </Link>
        </div>
      </div>

      {/* Table Section */}
      {loading && products.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Loading Inventory...</div>
      ) : error ? (
         <div className="text-center text-red-500 bg-red-50 p-4 rounded border border-red-200">{error}</div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[var(--color-darkgreen)] text-white">
                <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider w-24">Image</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Price</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center relative group">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(product.images[0])} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Img"; }} 
                                />
                            ) : product.image ? (
                                <img 
                                  src={getImageUrl(product.image)} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = "https://placehold.co/150?text=No+Img"; }} 
                                />
                            ) : (
                                <FaBoxOpen className="text-gray-400" />
                            )}
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="text-sm font-bold text-gray-900">{product.productName}</div>
                        <div className="text-xs text-gray-500 font-mono">ID: {product.productId}</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">₹{product.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                        <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-bold border border-blue-100">
                            {getCategoryName(product)}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <Link to={`/admin/product/${product.productId}/edit`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Edit">
                                <FaEdit size={16} />
                            </Link>
                            <button onClick={() => handleDelete(product.productId)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                                <FaTrash size={16} />
                            </button>
                        </div>
                    </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                            {products.length === 0 ? "No products found." : "No matching products."}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;