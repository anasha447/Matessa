import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { toast } from "react-toastify";

// ✅ Utilities & Redux
import { getImageUrl } from "../utils/imageUrl.js";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";

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

  const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => {
    if (!startX) return;
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) setStartX(null);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading Featured Items...</div>;
  if (products.length === 0) return null; 

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-12 font-heading text-[var(--color-darkgreen)] tracking-tight">
          Featured Products
        </h2>

        {/* Scroll Container */}
        <div
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 px-4 w-full justify-start md:justify-center pb-8
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {products.map((product) => {
            const displayImage = (product.images && product.images.length > 0) 
                ? product.images[0] 
                : product.image;

            return (
              <div
                key={product.productId}
                className="group cursor-pointer flex-shrink-0 w-[290px] md:w-[300px] snap-center flex flex-col items-center"
                onClick={() => navigate(`/product/${product.productId}`)}
              >
                {/* 1. IMAGE CONTAINER (Border is here now) */}
                <div className="
                   relative w-full h-[300px] md:h-[300px] bg-gray-50 rounded-[2rem] overflow-hidden 
                   border border-gray-500 transition-all duration-500 
                   group-hover:border-[var(--color-orange)] group-hover:shadow-lg
                ">
                  <img
                    src={getImageUrl(displayImage)} 
                    alt={product.productName}
                    className="w-full h-full object-contain p-0 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                  />
                   
                  {/* Quick Add Button (Appears on Hover) */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="
                      absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 
                      bg-[var(--color-green)] text-white px-6 py-2.5 rounded-full border-1 border-darkgreen 
                      font-bold text-sm shadow-md opacity-0 
                      group-hover:translate-y-0 group-hover:opacity-100 
                      transition-all duration-300 hover:bg-[var(--color-orange)]
                    "
                  >
                    Add to Cart
                  </button>
                </div>

                {/* 2. PRODUCT INFO (Elegant & Minimal) */}
                <div className="mt-5 text-center px-2">
                  <h3 className="text-xl font-heading font-bold text-gray-800 group-hover:text-[var(--color-darkgreen)] transition-colors">
                    {product.productName}
                  </h3>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    {product.specialPrice ? (
                      <>
                         <span className="text-[var(--color-green)] font-bold text-lg font-body">₹{product.specialPrice.toFixed(0)}</span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-bold text-lg">₹{product.price.toFixed(1)}</span>
                    )}
                  </div>
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