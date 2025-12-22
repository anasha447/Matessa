import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ShopBanner from "../components/banner-shop";
import { getImageUrl } from "../utils/imageUrl.js";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { fetchCategories } from "../redux/slices/categorySlice"; 
import { addToCart } from "../redux/slices/cartSlice";

// Icons
import { Filter, SlidersHorizontal } from "lucide-react";

const ShopPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Redux State
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  // 2. Local State
  const [selectedCategoryId, setSelectedCategoryId] = useState("All"); 
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // 3. Initial Fetch
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // 4. Filter Logic (Sorting Removed)
  const processedProducts = useMemo(() => {
    let result = [...products];

    // ✅ ROBUST CATEGORY FILTERING
    if (selectedCategoryId !== "All") {
      result = result.filter((p) => {
        // Handle both nested object (p.category.categoryId) and flat field (p.categoryId)
        const productCatId = p.category?.categoryId || p.categoryId; 
        
        // Convert both to String to safely compare "1" vs 1
        return String(productCatId) === String(selectedCategoryId);
      });
    }

    return result;
  }, [products, selectedCategoryId]);

  // 5. Add to Cart
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addToCart({
      productId: product.productId,
      quantity: 1
    }));
  };

  if (productsLoading || categoriesLoading) {
    return (
        <div className="h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green)]"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopBanner />

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR (Categories) --- */}
        <aside className={`md:w-1/4 ${showMobileFilter ? 'block' : 'hidden'} md:block`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-[var(--color-darkgreen)]">
              <SlidersHorizontal size={20} />
              <h3 className="text-xl font-bold font-heading">Filters</h3>
            </div>

            <div className="mb-6">
              {/* ✅ Renamed to Categories */}
              <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Categories</h4>
              <ul className="space-y-2">
                {/* "All" Option */}
                <li>
                  <button
                    onClick={() => setSelectedCategoryId("All")}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategoryId === "All"
                        ? "bg-[var(--color-green)] text-white font-medium shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    All Products
                  </button>
                </li>

                {/* Backend Categories */}
                {categories.map((cat) => (
                  <li key={cat.categoryId}>
                    <button
                      onClick={() => setSelectedCategoryId(cat.categoryId)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        String(selectedCategoryId) === String(cat.categoryId)
                          ? "bg-[var(--color-green)] text-white font-medium shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.categoryName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* --- RIGHT SIDE (Product Grid) --- */}
        <div className="md:w-3/4">
          
          {/* Top Bar */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <p className="text-gray-500">
              Showing <span className="font-bold text-gray-800">{processedProducts.length}</span> results
            </p>

            <div className="flex gap-4">
              <button 
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm text-gray-700"
                onClick={() => setShowMobileFilter(!showMobileFilter)}
              >
                <Filter size={16} /> Filter Categories
              </button>
              
              {/* Removed Sort Dropdown */}
            </div>
          </div>

          {/* Product Grid */}
          {processedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
              <p className="text-xl text-gray-400 mb-2">No products found in this category.</p>
              <button 
                onClick={() => setSelectedCategoryId("All")}
                className="mt-2 text-[var(--color-orange)] font-semibold hover:underline"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedProducts.map((product) => (
                <div
                  key={product.productId}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer flex flex-col"
                  onClick={() => navigate(`/product/${product.productId}`)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[1/1.1] bg-gray-50 p-4">
                    <img
                      src={getImageUrl(product.image || product.images?.[0])}
                      alt={product.productName}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow items-center text-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      {product.category?.categoryName || "Matessa"}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-[var(--color-darkgreen)] mb-2 line-clamp-1">
                      {product.productName}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {product.specialPrice && product.specialPrice < product.price ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">₹{product.price}</span>
                          <span className="text-[var(--color-orange)] font-bold text-lg">₹{product.specialPrice}</span>
                        </>
                      ) : (
                        <span className="text-[var(--color-green)] font-bold text-lg">₹{product.price}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="mt-auto w-full bg-[var(--color-lightgreen)] text-white py-2 rounded-full font-semibold hover:bg-[var(--color-darkgreen)] transition-colors shadow-sm active:scale-95"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;