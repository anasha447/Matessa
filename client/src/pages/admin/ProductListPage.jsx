import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaBoxOpen, FaTags } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

// Imports
import { fetchAllProducts, deleteProduct } from "../../redux/slices/productSlice"; 
import { fetchCategories } from "../../redux/slices/categorySlice"; 

const ProductListPage = () => {
  const dispatch = useDispatch();

  // 1. Get State
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);

  // 2. Fetch Data on Mount
  useEffect(() => {
      // Fetch Products
      dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 100 }));
      
      // ✅ Fetch Categories (Crucial for mapping IDs to Names)
      dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await dispatch(deleteProduct(id)); 
        toast.success("Product deleted successfully");
        dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 100 })); 
      } catch (err) {
        dispatch(fetchAllProducts({ pageNumber: 0, pageSize: 100 }));
      }
    }
  };

  // ✅ HELPER: Robust Category Name Lookup
  const getCategoryName = (product) => {
      // 1. Try nested object from ProductDTO
      if (product.category && product.category.categoryName) {
          return product.category.categoryName;
      }
      // 2. Try looking up by ID in the categories list
      // Using '==' to handle potential string/number mismatches
      if (product.categoryId && categories.length > 0) {
          const found = categories.find(cat => cat.categoryId == product.categoryId);
          if (found) return found.categoryName;
      }
      return "Uncategorized";
  };

  // ✅ HELPER: Image URL Builder
  const getImageUrl = (imageName) => {
      if (!imageName || imageName === "default.png") return null;
      // Ensure this matches your Spring Boot port
      return `http://localhost:8080/api/public/images/${imageName}`;
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-12 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
            <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] font-heading">
            Product Management
            </h1>
            <p className="text-gray-500 mt-1">Manage inventory, prices, and images</p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/admin/categories" className="bg-white border-2 border-[var(--color-orange)] text-[var(--color-orange)] py-2 px-5 rounded-full flex items-center gap-2 hover:bg-orange-50 font-bold transition-colors shadow-sm">
              <FaTags /> Manage Categories
            </Link>
            <Link to="/admin/product/create" className="bg-[var(--color-orange)] text-white py-2 px-5 rounded-full flex items-center gap-2 hover:opacity-90 shadow-md font-bold transition-transform active:scale-95">
              <FaPlus /> Add New Product
            </Link>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 font-bold">Loading...</div>
      ) : error ? (
         <div className="text-center text-red-500 bg-red-50 p-4 rounded border border-red-200">{error}</div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[var(--color-darkgreen)] text-white">
                <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Image</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Price</th>
                    <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {products && products.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                            {product.image && product.image !== "" ? (
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
                        <div className="text-xs text-gray-500">ID: {product.productId}</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">₹{product.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                        {/* ✅ Category Name Display */}
                        <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-bold">
                            {getCategoryName(product)}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                            <Link to={`/admin/product/${product.productId}/edit`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><FaEdit size={18} /></Link>
                            <button onClick={() => handleDelete(product.productId)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><FaTrash size={18} /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {products?.length === 0 && (
              <div className="text-center py-10 text-gray-500">No products found. Start by adding one!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;