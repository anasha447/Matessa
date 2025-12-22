import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { toast } from "react-toastify";

// ✅ Utilities & Redux
import { getImageUrl } from "../utils/imageUrl.js";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";

// ⚠️ FIXED: Changed from 3 to 1 based on your previous JSON data
// If this fails, check GET /api/public/categories to find the real ID
const FEATURED_CATEGORY_ID = 1; 

// ✅ Standardized API URL definition
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") + "/api" 
  : "http://localhost:8080/api";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [startX, setStartX] = useState(null);

  // ✅ 1. Fetch Products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/public/categories/${FEATURED_CATEGORY_ID}/products`);
        
        // Handle Spring Boot Page response structure
        const productList = Array.isArray(data) ? data : (data.content || []);
        
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // ✅ 2. Add to Cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await dispatch(addToCart({
        productId: product.productId, 
        quantity: 1
      })).unwrap();
      toast.success(`Added ${product.productName} to cart`);
    } catch (err) {
      toast.error(err || "Could not add to cart");
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    if (!startX) return;
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) setStartX(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading Featured Items...</div>;
  
  // Don't render section if empty
  if (products.length === 0) return null; 

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-[1400px] mx-auto text-center w-full flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-10 font-heading text-[var(--color-darkgreen)]">
          Featured Products
        </h2>

        <div
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 px-4 pr-4 md:-mx-4 pb-3 w-full justify-start md:justify-center
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {products.map((product) => {
            // ✅ Image Logic: Support both single 'image' and list 'images'
            const displayImage = (product.images && product.images.length > 0) 
                ? product.images[0] 
                : product.image;

            return (
              <div
                key={product.productId}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 
                cursor-pointer group flex-shrink-0 w-[85%] sm:w-[250px] md:w-[280px] snap-center border border-gray-100"
                onClick={() => navigate(`/product/${product.productId}`)}
              >
                {/* Product Image Area */}
                <div className="relative overflow-hidden h-[280px] bg-gray-50">
                  <img
                    src={getImageUrl(displayImage)} 
                    alt={product.productName}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay with Description */}
                  <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center px-4">
                    <p className="text-center text-sm font-body line-clamp-3">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-5 flex flex-col items-center text-center">
                  <h3 className="text-lg font-body font-semibold text-[var(--color-darkgreen)] line-clamp-1">
                    {product.productName}
                  </h3>
                  <p className="text-[var(--color-orange)] font-bold mt-1">
                    ₹{product.price?.toFixed(2)}
                  </p>
                </div>

                {/* Cart Button */}
                <div className="pb-5 flex justify-center">
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-[var(--color-green)] text-white px-6 py-2 rounded-full font-semibold font-body hover:bg-[var(--color-lightgreen)] hover:scale-105 transition duration-300 shadow-md"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;