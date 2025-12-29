import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { FaStar, FaRegStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Questions from "../components/questions";
import MasonryUsage from "../components/MasonryUsage.jsx";
import { getImageUrl } from "../utils/imageUrl.js";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { fetchProductDetails, createProductReview, resetReviewSuccess } from "../redux/slices/productSlice";

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux State
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedProduct: product, loading, reviewSuccess, error } = useSelector((state) => state.products);

  // Local State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    if (id) {
        dispatch(fetchProductDetails(id));
        setSelectedVariant(null);
        setQuantity(1);
        setCurrentImageIndex(0);
    }
  }, [dispatch, id]);

  // 2. Initialize Variants
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
    }
  }, [product]);

  // 3. Handle Review Reset
  useEffect(() => {
    if (reviewSuccess) {
        toast.success("Review submitted!");
        setRating(0);
        setComment("");
        dispatch(resetReviewSuccess());
        dispatch(fetchProductDetails(id)); 
    }
  }, [reviewSuccess, dispatch, id]);

  // --- IMAGE LOGIC ---
  const productImages = product 
    ? (product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : [])) 
    : [];

  const mainImage = productImages.length > 0 ? productImages[currentImageIndex] : "";

  // --- HANDLERS ---

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
    
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
        return toast.error("Please select a weight option");
    }

    try {
      // ✅ FIX: Sending 'variantId' instead of name
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
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
        return toast.error("Please select a weight option");
    }

    try {
      // ✅ FIX: Sending 'variantId' here too
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

    dispatch(createProductReview({
        productId: id,
        reviewData: { rating, comment }
    }));
  };

  // --- RENDER ---

  if (loading) return <Spinner />;
   
  if (error || !product) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Product Not Found</h2>
            <button onClick={() => navigate('/shop')} className="bg-[var(--color-green)] text-white px-8 py-3 rounded-lg hover:opacity-90 shadow-lg">Back to Shop</button>
        </div>
    );
  }

  // Check Featured Logic
  const isFeatured = 
      (product?.category?.categoryId === 1) || 
      (product?.category?.id === 1) ||       
      (product?.categoryId === 1);           

  const displayPrice = selectedVariant ? selectedVariant.price : product.specialPrice;

  return (
    <div className="py-12 px-4 md:px-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start">
           
          {/* --- LEFT: IMAGES --- */}
          <div className="w-full md:w-1/2 flex flex-col items-center relative">
            {mainImage ? (
              <>
                <div className="w-full flex justify-center items-center relative h-[400px] md:h-[500px]">
                  {productImages.length > 1 && (
                      <button onClick={handlePrevImage} className="absolute left-2 bg-gray-800/50 text-white p-3 rounded-full z-10 hover:bg-[var(--color-orange)] transition-colors"><FaChevronLeft /></button>
                  )}
                  <img src={getImageUrl(mainImage)} alt={product.productName} className="rounded-xl shadow-lg w-full h-full object-contain bg-white" />
                   {productImages.length > 1 && (
                      <button onClick={handleNextImage} className="absolute right-2 bg-gray-800/50 text-white p-3 rounded-full z-10 hover:bg-[var(--color-orange)] transition-colors"><FaChevronRight /></button>
                   )}
                </div>
                {/* Thumbnails */}
                {productImages.length > 1 && (
                    <div className="flex gap-3 mt-6 overflow-x-auto py-2 px-1 w-full justify-center">
                    {productImages.map((img, index) => (
                        <div key={index} onClick={() => handleThumbnailClick(index)} className={`w-20 h-20 flex-shrink-0 rounded-md cursor-pointer border-2 overflow-hidden transition-all ${currentImageIndex === index ? "border-[var(--color-orange)] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}>
                            <img src={getImageUrl(img)} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    </div>
                )}
              </>
            ) : (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-xl"><p className="text-gray-500">No Image Available</p></div>
            )}
          </div>

          {/* --- RIGHT: INFO --- */}
          <div className="w-full md:w-1/2 mt-10 md:mt-0 md:pl-12 flex flex-col">
            <h1 className="text-3xl font-body font-bold text-[var(--color-darkgreen)]">{product.productName}</h1>
            
            <p className="text-[var(--color-green)] font-bold font-body text-2xl mt-6">₹{displayPrice?.toFixed(2)}</p>

            {/* FLAVOR SECTION */}
            {isFeatured && product.flavors && product.flavors.length > 0 && (
                <div className="mt-6">
                    <label className="block text-gray-800 mb-3 font-semibold">Flavor:</label>
                    <div className="flex flex-wrap gap-3">
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
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm ${!isActive && "hover:opacity-80 hover:bg-gray-50"}`}
                                >
                                    {flavor.flavorName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* WEIGHT SECTION */}
            {isFeatured && product.variants && product.variants.length > 0 && (
                <div className="mt-6">
                  <label className="block text-gray-800 mb-2 font-semibold">Weight:</label>
                  <div className="flex gap-3">
                      {product.variants.map((v, index) => (
                          <button
                            key={index}
                            disabled={v.stock === 0}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                                selectedVariant?.variantId === v.variantId
                                ? "border-[var(--color-green)] bg-[var(--color-green)] text-white shadow-sm"
                                : "border-gray-300 bg-white text-gray-700 hover:border-[var(--color-green)]"
                            } ${v.stock === 0 ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
                          >
                             {v.name} {v.stock === 0 ? "(Out of Stock)" : ""}
                          </button>
                      ))}
                  </div>
                </div>
            )}

            {/* QUANTITY */}
            <div className="mt-6">
              <label className="block text-gray-800 mb-2 font-semibold">Quantity:</label>
              <div className="flex items-center">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-[var(--color-orange)]">-</button>
                <span className="mx-4 text-lg font-semibold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-[var(--color-orange)]">+</button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <button onClick={handleBuyNow} className="w-full md:w-auto text-white px-8 py-3 rounded-md font-semibold bg-[var(--color-orange)] hover:opacity-90 shadow-md transition-all active:scale-95">Buy Now</button>
              <button onClick={handleAddToCart} className="w-full md:w-auto border-1 border-orange text-black px-8 py-3 rounded-md font-semibold bg-[var(--color-white)] hover:bg-[var(--color-orange)] shadow-md transition-all active:scale-95">Add to Cart</button>
            </div>

            <p className="text-gray-700 mt-8 leading-relaxed">{product.description}</p>
          </div>
        </div>

        <div className="mt-16 border-t pt-12"><MasonryUsage/><Questions /></div>
      </div>
    </div>
  );
};

export default SingleProductPage;