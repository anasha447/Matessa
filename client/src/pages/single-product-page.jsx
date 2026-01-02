import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { FaArrowLeft, FaArrowRight, FaBolt, FaLeaf, FaBrain } from "react-icons/fa"; // Changed icons to standard arrows
import Questions from "../components/questions";
import MasonryUsage from "../components/MasonryUsage.jsx";
import CultureSection from "../components/CultureSection";
import { getImageUrl } from "../utils/imageUrl.js";
import parse from 'html-react-parser';
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchProductDetails, createProductReview, resetReviewSuccess } from "../redux/slices/productSlice";

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

  useEffect(() => {
    if (id) {
        dispatch(fetchProductDetails(id));
        setSelectedVariant(null);
        setQuantity(1);
        setCurrentImageIndex(0);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
        setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  useEffect(() => {
    if (reviewSuccess) {
        toast.success("Review submitted!");
        setRating(0);
        setComment("");
        dispatch(resetReviewSuccess());
        dispatch(fetchProductDetails(id)); 
    }
  }, [reviewSuccess, dispatch, id]);

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

  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  const handleFlavorClick = (targetProductId) => {
    if (targetProductId === product.productId) return;
    navigate(`/product/${targetProductId}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariant) return toast.error("Please select a weight option");

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
    if (product.variants && product.variants.length > 0 && !selectedVariant) return toast.error("Please select a weight option");

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

  if (loading) return <Spinner />;
  if (error || !product) return <div className="text-center py-20">Product Not Found</div>;

  const isFeatured = (product?.category?.categoryId === 1) || (product?.category?.id === 1) || (product?.categoryId === 1);           
  const displayPrice = selectedVariant ? selectedVariant.price : product.specialPrice;

  return (
    <div className="py-12 px-4 md:px-12 bg-white font-body">
      <div className="container mx-auto">
        
        {/* ✅ MAIN LAYOUT */}
        <div className="flex flex-col md:flex-row items-start relative gap-12 mb-16">
           
          {/* --- LEFT COLUMN: STICKY IMAGE --- */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:sticky md:top-0 self-start transition-all duration-300 z-10">
            {mainImage ? (
              <>
                {/* IMAGE CONTAINER */}
                <div className="w-full relative -mx-4 md:mx-0 flex justify-center items-center bg-white">
                  
                  {/* Main Image */}
                  <img 
                    src={getImageUrl(mainImage)} 
                    alt={product.productName} 
                    className="w-full h-auto max-h-[85vh] object-contain" 
                  />
                </div>

                {/* ✅ CUSTOM PAGINATION CONTROL (Matches Screenshot) */}
                {productImages.length > 1 && (
                  <div className="mt-2 flex items-center justify-between bg-yellow rounded-full px-6 py-2 w-[100px] h-8 shadow-sm select-none">
                    <button 
                      onClick={handlePrevImage} 
                      className="text-[#7A2E19] hover:scale-110 transition-transform active:scale-95"
                    >
                      <FaArrowLeft size={12} />
                    </button>
                    
                    <span className="text-[#7A2E19] font-bold font-mono text-lg tracking-wider">
                      {currentImageIndex + 1}/{productImages.length}
                    </span>
                    
                    <button 
                      onClick={handleNextImage} 
                      className="text-[#7A2E19] hover:scale-110 transition-transform active:scale-95"
                    >
                      <FaArrowRight size={12} />
                    </button>
                  </div>
                )}

                {/* Thumbnails (Hidden if pagination is preferred, or keep as secondary nav) */}
                {/* <div className="flex gap-3 mt-8 overflow-x-auto py-2 px-1 w-full justify-center opacity-50 hover:opacity-100 transition-opacity">
                    {productImages.map((img, index) => ( ... ))}
                </div> 
                */}
              </>
            ) : (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-xl"><p className="text-gray-400">No Image Available</p></div>
            )}
          </div>

          {/* --- RIGHT COLUMN: PRODUCT STORY & ACTIONS --- */}
          <div className="w-full md:w-1/2 flex flex-col space-y-8 md:pt-12">
            
            {/* 1. TITLE & STORY */}
            <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-darkgreen)] leading-tight mb-4">
                    {product.productName}
                </h1>
                <p className="text-gray-500 text-base leading-relaxed font-body font-semibold">
                    Experience the ritual of <span className="text-[var(--color-orange)] font-bold">Matessa</span>. 
                    Sourced from the heart of South America and blended with pure Indian botanicals. 
                    Elevate your energy, naturally.
                </p>
            </div>

            {/* 2. HEALTH BENEFITS */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-green-50 text-[var(--color-green)] rounded-full text-xl"><FaBolt /></div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Clean Energy</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-orange-50 text-[var(--color-orange)] rounded-full text-xl"><FaLeaf /></div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">100% Natural</span>
                </div>
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-full text-xl"><FaBrain /></div>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Focus</span>
                </div>
            </div>

            {/* 3. PRICE */}
            <div>
                <p className="text-gray-400 text-sm mt-1 font-semibold">Price</p>
                <p className="text-[var(--color-green)] font-bold font-body text-3xl">
                    ₹{displayPrice?.toFixed(2)}
                </p>
            </div>

            {/* 4. FLAVOR SELECTOR */}
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

            {/* 5. WEIGHT & QTY */}
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

            {/* 6. MAIN ACTIONS */}
            <div className="flex gap-4 pt-4">
                <button onClick={handleBuyNow} className="flex-1 bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-100 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                    Buy Now
                </button>
                <button onClick={handleAddToCart} className="flex-1 border-2 border-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:border-[var(--color-darkgreen)] hover:text-[var(--color-darkgreen)] bg-white transition-all active:scale-95">
                    Add to Cart
                </button>
            </div>

            {/* 7. HTML DESCRIPTION */}
            <div className="
                pt-10 border-t border-gray-100
                text-gray-600 
                font-body
                font-semibold
                text-base
                leading-7
                break-words max-w-full whitespace-normal
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-[var(--color-darkgreen)]
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-3
                [&_strong]:font-bold [&_strong]:text-gray-800
                [&_p]:mb-6
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
            ">
                {parse(product.description || "")}
            </div>

          </div>
        </div>
        
        <div className="w-full mt-12">
            <CultureSection />
        </div>

        {/* ✅ MASONRY GALLERY */}
        <div className="w-full mt-24">
            <MasonryUsage />
        </div>

        {/* --- BOTTOM SECTION --- */}
        <div className="mt-24 pt-16 border-t border-gray-200">
            <Questions />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;