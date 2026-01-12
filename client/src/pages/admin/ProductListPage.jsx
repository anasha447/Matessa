import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaTags, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Imports
import { fetchAllProducts, deleteProduct } from "../../redux/slices/productSlice"; 
import { fetchCategories } from "../../redux/slices/categorySlice"; 

// ✅ FIX 1: Dynamic API URL based on environment
// This prevents hardcoding production URL in development
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://matessa.in";

const ProductListPage = () => {
  const dispatch = useDispatch();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redux State
  const { items: products = [], loading, error } = useSelector((state) => state.products);
  const { items: categories = [] } = useSelector((state) => state.categories);

  // ✅ FIX 2: Robust Fetching Logic
  // We fetch categories if missing. We force fetch products to ensure admin sees latest stock.
  const loadData = async () => {
    setIsRefreshing(true);
    try {
        await Promise.all([
            dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 100 })).unwrap(),
            dispatch(fetchCategories()).unwrap()
        ]);
    } catch (err) {
        console.error("Failed to load inventory:", err);
        // Toast is handled by slice usually, but safe to log here
    } finally {
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
      loadData();
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      try {
        await dispatch(deleteProduct(id)).unwrap(); 
        toast.success("Product deleted successfully");
      } catch (err) {
        toast.error("Failed to delete product. It might be in an active order.");
      }
    }
  };

  const getCategoryName = (product) => {
      if (product.category?.categoryName) return product.category.categoryName;
      const found = categories.find(cat => cat.categoryId == product.categoryId);
      return found ? found.categoryName : "Uncategorized";
  };

  const getImageUrl = (imageName) => {
      if (!imageName || imageName === "default.png") return null;
      if (imageName.startsWith("http")) return imageName;
      return `${API_BASE_URL}/api/public/images/${imageName}`;
  };

  const filteredProducts = products.filter(product => 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 bg-gray-50 min-h-screen font-body">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-darkgreen)] font-heading flex items-center gap-3">
               <FaBoxOpen className="text-[var(--color-orange)]" /> Product Inventory
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your catalog, stock levels, and pricing.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name or ID..." 
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Refresh Button */}
            <button 
                onClick={loadData} 
                disabled={loading || isRefreshing}
                className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh Data"
            >
                <FaSyncAlt className={`${(loading || isRefreshing) ? "animate-spin" : ""}`} />
            </button>

            {/* Actions */}
            <Link to="/admin/categories" className="bg-white border border-gray-200 text-gray-700 py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 font-semibold transition-colors text-sm">
              <FaTags className="text-[var(--color-orange)]" /> Categories
            </Link>
            <Link to="/admin/product/create" className="bg-[var(--color-orange)] text-white py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e05515] shadow-md shadow-orange-100 font-bold transition-all transform active:scale-95 text-sm">
              <FaPlus /> Add Product
            </Link>
        </div>
      </div>

      {/* --- CONTENT --- */}
      {loading && products.length === 0 ? (
        // Skeleton Loader
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
        </div>
      ) : error ? (
         <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-red-100">
            <div className="bg-red-50 p-4 rounded-full mb-3 text-red-500">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800">Failed to load products</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button onClick={loadData} className="text-blue-600 hover:underline">Try Again</button>
         </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Img</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.productId} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(product.images[0])} 
                                  alt={product.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Img"; }} 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <FaBoxOpen size={20} />
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm">{product.productName}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {product.productId}</span>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <span className="font-mono font-semibold text-gray-700 text-sm">₹{product.price.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {getCategoryName(product)}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Link 
                                to={`/admin/product/${product.productId}/edit`} 
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                                title="Edit Product"
                            >
                                <FaEdit size={15} />
                            </Link>
                            <button 
                                onClick={() => handleDelete(product.productId)} 
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                title="Delete Product"
                            >
                                <FaTrash size={15} />
                            </button>
                        </div>
                    </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="5" className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <FaBoxOpen size={48} className="mb-3 opacity-20" />
                                <p className="text-sm">No products match your search.</p>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="mt-2 text-[var(--color-orange)] text-xs hover:underline">
                                        Clear Search
                                    </button>
                                )}
                            </div>
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