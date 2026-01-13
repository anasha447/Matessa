import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; 
import Questions from "../components/questions";
import MateRitual from "../components/mateRitual";
import CultureSection from "../components/CultureSection";
import parse from 'html-react-parser';
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchProductDetails, createProductReview, resetReviewSuccess } from "../redux/slices/productSlice";

// ✅ 1. DEFINE API URL
const API_BASE_URL = "https://matessa.in";

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { selectedProduct: product, loading, reviewSuccess, error } = useSelector((state) => state.products);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // ✅ Force Fetch on Mount (Background Refresh)
  useEffect(() => {
    if (id) {
        dispatch(fetchProductDetails(id));
        // Reset state only if ID changes (New Product)
        if (product?.productId?.toString() !== id) {
            setQuantity(1);
            setCurrentImageIndex(0);
            setSelectedVariant(null);
        }
    }
  }, [dispatch, id]);

  // ✅ Sync Local State
  useEffect(() => {
    if (product && product.productId?.toString() === id?.toString()) {
        if (!selectedVariant && product.variants?.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }
  }, [product, id, selectedVariant]);

  useEffect(() => {
    if (reviewSuccess) {
        toast.success("Review submitted!");
        setRating(0);
        setComment("");
        dispatch(resetReviewSuccess());
        dispatch(fetchProductDetails(id)); 
    }
  }, [reviewSuccess, dispatch, id]);

  const getProductImage = (imageName) => {
    if (!imageName) return "/assets/placeholder.png";
    if (imageName.startsWith("http")) return imageName; 
    return `${API_BASE_URL}/images/${imageName}`;
  };

  const productImages = product 
    ? (product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : [])) 
    : [];

  const mainImage = productImages.length > 0 ? productImages[currentImageIndex] : "";

  const handleNextImage = () => {
    if (productImages.length > 0) setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    if (productImages.length > 0) setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleFlavorClick = (targetProductId) => {
    if (targetProductId === product.productId) return;
    navigate(`/product/${targetProductId}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariant) return toast.error("Please select a size option");
    try {
      await dispatch(addToCart({
        productId: product.productId,
        quantity: quantity,
        variantId: selectedVariant ? selectedVariant.variantId : null
      })).unwrap();
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariant) return toast.error("Please select a size option");
    try {
      await dispatch(addToCart({
        productId: product.productId,
        quantity: quantity,
        variantId: selectedVariant ? selectedVariant.variantId : null
      })).unwrap();
      navigate("/checkoutpage");
    } catch (err) {
      toast.error("Could not process Buy Now");
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userInfo) return navigate("/login");
    if (!comment || rating === 0) return toast.error("Please add rating and comment");
    dispatch(createProductReview({ productId: id, reviewData: { rating, comment } }));
  };

  // ---------------------------------------------
  // ✅ SMART LOADING LOGIC
  // ---------------------------------------------
  const isDataLoaded = product && product.productId?.toString() === id?.toString();

  if (loading && !isDataLoaded) return <Spinner />;
  if (!loading && !isDataLoaded && !error) return <Spinner />;
  if (!isDataLoaded || error) return <div className="text-center py-20 text-xl font-bold text-gray-400">Product Not Found</div>;
  
  const isFeatured = (product?.category?.categoryId === 1) || (product?.category?.id === 1) || (product?.categoryId === 1);           
  const displayPrice = selectedVariant ? selectedVariant.price : product.specialPrice;

  return (
    <div className="py-12 px-4 md:px-12 bg-white font-body">
      <div className="container mx-auto">
        
        {/* ✅ MAIN LAYOUT */}
        <div className="flex flex-col md:flex-row items-start relative gap-12 mb-16">
           
          {/* LEFT: IMAGE */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:sticky md:top-24 self-start transition-all duration-300 z-10">
            {mainImage ? (
              <>
                <div className="w-full relative -mx-4 md:mx-0 flex justify-center items-center bg-white">
                  <img 
                    src={getProductImage(mainImage)} 
                    alt={product.productName} 
                    className="w-full h-auto max-h-[85vh] object-contain" 
                    onError={(e) => { e.target.src = "/assets/placeholder.png"; }} 
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="mt-2 flex items-center justify-between bg-gray-100 rounded-full px-6 py-2 w-[100px] h-8 shadow-sm select-none">
                    <button onClick={handlePrevImage} className="text-green hover:scale-110 transition-transform active:scale-95"><FaArrowLeft size={12} /></button>
                    <span className="text-green font-bold font-mono text-lg tracking-wider">{currentImageIndex + 1}/{productImages.length}</span>
                    <button onClick={handleNextImage} className="text-green hover:scale-110 transition-transform active:scale-95"><FaArrowRight size={12} /></button>
                  </div>
                )}
              </>
            ) : (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl"><p className="text-gray-400">No Image Available</p></div>
            )}
          </div>

          {/* RIGHT: STORY & ACTIONS */}
          <div className="w-full md:w-1/2 flex flex-col space-y-8 md:pt-12">
            
            <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-darkgreen)] leading-tight mb-4 text-center">
                    {product.productName}
                </h1>
                <p className="text-gray-500 text-base leading-relaxed font-body font-semibold text-center">
                  <span className="font-bold text-[var(--color-green)]">Yerba Mate </span>  loose Leaf Imported from the farms of South America, our Yerba Mate offers the premium taste. 
                  <br/> <span className="font-bold text-[var(--color-green)]">We hand-craft </span>every batch with mixing the ingredients to create a perfectly balanced and suitable Enargy . <br/>
                  <span className="font-bold text-lg text-[var(--color-green)]">Upgrade your daily routine with</span> <span className="font-bold text-lg text-[var(--color-orange)]">MATESSA</span> blends.
                </p>
            </div>

            <div>
                <p className="text-gray-400 text-sm mt-1 font-semibold">Price</p>
                <p className="text-[var(--color-green)] font-bold font-body text-3xl">
                    ₹{displayPrice?.toFixed(2)}
                </p>
            </div>

            {/* FLAVOR SELECTOR */}
            {isFeatured && product.flavors && product.flavors.length > 0 && (
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Flavor</label>
                    <div className="flex flex-wrap gap-2">
                        {product.flavors.map((flavor, index) => {
                            const isActive = flavor.targetProductId === product.productId;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleFlavorClick(flavor.targetProductId)}
                                    style={{
                                        backgroundColor: isActive ? (flavor.colorCode || 'var(--color-orange)') : 'white',
                                        borderColor: flavor.colorCode || '#ddd',
                                        color: isActive ? 'white' : '#374151'
                                    }}
                                    className={`px-5 py-2 rounded-full border text-sm font-bold transition-all transform ${!isActive && "hover:scale-105 hover:shadow-sm"}`}
                                >
                                    {flavor.flavorName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* WEIGHT & QTY */}
            <div className="flex flex-row gap-6 items-end">
                {isFeatured && product.variants && product.variants.length > 0 && (
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Size</label>
                        <div className="flex gap-2">
                            {product.variants.map((v, index) => (
                                <button
                                    key={index}
                                    disabled={v.stock === 0}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`flex-1 py-2 px-2 rounded-lg border font-bold text-sm transition-all whitespace-nowrap overflow-hidden text-ellipsis ${
                                        selectedVariant?.variantId === v.variantId
                                        ? "border-[var(--color-green)] bg-[var(--color-green)] text-white shadow-md shadow-green-100"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                    } ${v.stock === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-24 flex-shrink-0">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Quantity</label>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-1 h-[38px]">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[var(--color-orange)] transition-colors text-lg">-</button>
                        <span className="flex-1 text-center font-bold text-gray-800 text-sm">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[var(--color-orange)] transition-colors text-lg">+</button>
                    </div>
                </div>
            </div>

            {/* MAIN ACTIONS */}
            <div className="flex gap-4 pt-4">
                <button onClick={handleBuyNow} className="flex-1 bg-[var(--color-orange)] text-white py-3 rounded-xl font-bold font-body text-lg shadow-lg shadow-orange-100 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                    Buy Now
                </button>
                <button onClick={handleAddToCart} className="flex-1 border-2 border-gray-200 text-gray-800 py-3 rounded-xl font-bold font-body text-lg hover:border-[var(--color-darkgreen)] hover:text-[var(--color-darkgreen)] bg-white transition-all active:scale-95">
                    Add to Cart
                </button>
            </div>
            
           {/* 7. ✅ FIXED HTML DESCRIPTION */}
            {/* 7. ✅ ROOT FIX: FORCE WHOLE WORDS & CLEAN HIDDEN CHARS */}
<div 
    className="
        pt-10 border-t border-gray-100
        text-gray-600 
        font-body
        font-semibold
        text-base
        leading-7
        max-w-full
        /* Standard Typography */
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-[var(--color-darkgreen)]
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3
        [&_strong]:font-bold [&_strong]:text-gray-800
        [&_p]:mb-6
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
    "
    style={{ 
        // 🚨 THE "KEEP WORDS TOGETHER" RULES 🚨
        wordBreak: 'normal',       // Never break words arbitrarily
        overflowWrap: 'break-word',// Only break if the word is wider than the screen
        whiteSpace: 'normal',      // Collapse multiple spaces/enters into one
        hyphens: 'none',           // Disable hyphenation (fresh-ness)
        textAlign: 'left'
    }}
>
     <h3 className="font-bold text-2xl font-body py-6">Product Overview</h3>
     
     {/* Clean the HTML before parsing to remove hidden splitters */}
     {parse(
        (product.description || "")
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
        .replace(/&nbsp;/g, ' ')               // Replace non-breaking spaces with normal spaces
     )}
      </div>
          </div>
        </div>
        
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-12">
            <CultureSection />
        </div>

        <div className="w-full mt-12">
            <MateRitual/>
        </div>

        <div className="mt-12 pt-2 border-t border-gray-200">
            <Questions />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;