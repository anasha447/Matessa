import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ShopBanner from "../components/banner-shop";
import { Helmet } from "react-helmet-async"; 

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { fetchCategories } from "../redux/slices/categorySlice"; 
import { addToCart } from "../redux/slices/cartSlice";

// Icons
import { Filter, SlidersHorizontal } from "lucide-react";

// ✅ 1. Import Analytics Helper
import { trackAddToCart } from "../utils/analytics"; 

// ✅ 2. DEFINE API URL
const API_BASE_URL = "https://matessa.in"; 

const ShopPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { items: rawProducts, loading: productsLoading } = useSelector((state) => state.products);
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  // Local State
  const [selectedCategoryId, setSelectedCategoryId] = useState("All"); 
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Image Helper Function
  const getProductImage = (imageName) => {
    if (!imageName) return "https://matessa.in/assets/placeholder.webp"; 
    if (imageName.startsWith("http")) return imageName;
    return `${API_BASE_URL}/images/${imageName}`;
  };

  // Filter Logic
  const processedProducts = useMemo(() => {
    const productList = Array.isArray(rawProducts) 
        ? rawProducts 
        : (rawProducts?.content || []);

    let result = [...productList];

    if (selectedCategoryId !== "All") {
      result = result.filter((p) => {
        const productCatId = p.category?.categoryId || p.categoryId; 
        return String(productCatId) === String(selectedCategoryId);
      });
    }

    return result;
  }, [rawProducts, selectedCategoryId]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    // 1. Redux Action
    dispatch(addToCart({
      productId: product.productId,
      quantity: 1
    }));

    // ✅ 2. Analytics Trigger
    trackAddToCart(product);
  };

  // ---------------------------------------------
  // ✅ SEO CONFIGURATION START (UPDATED)
  // ---------------------------------------------
  const seoTitle = "Shop Premium Yerba Mate & Accessories | Matessa India";
  const seoDesc = "Explore our collection of authentic Yerba Mate and traditional gourds, bombillas, and starter kits. imported from South America.";
  const seoUrl = "https://matessa.in/shop";

  const productSchemaList = processedProducts.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://matessa.in/product/${product.productId}`,
    "name": product.productName,
    "image": getProductImage(product.image || product.images?.[0]),
    "offers": {
      "@type": "Offer",
      "price": product.specialPrice || product.price,
      "priceCurrency": "INR",
      "availability": (product.quantity > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  }));

  const shopSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Matessa Shop",
    "url": seoUrl,
    "description": seoDesc,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": productSchemaList 
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://matessa.in"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop",
          "item": seoUrl
        }
      ]
    }
  };
  // ---------------------------------------------
  // ✅ SEO CONFIGURATION END
  // ---------------------------------------------

  if (productsLoading || categoriesLoading) {
    return (
        <div className="h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green)]"></div>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={seoUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:image" content="https://matessa.in/full.logo.webp" /> 
        <script type="application/ld+json">
          {JSON.stringify(shopSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <ShopBanner />

        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
          
          {/* --- LEFT SIDEBAR (Categories) --- */}
          <aside className={`md:w-1/4 ${showMobileFilter ? 'block' : 'hidden'} md:block transition-all duration-300`}>
            <div className="bg-gray-50 p-8 rounded-[2rem] sticky top-24">
              <div className="flex items-center gap-3 mb-8 text-[var(--color-darkgreen)]">
                <SlidersHorizontal size={20} />
                <h3 className="text-xl font-bold font-heading">Filters</h3>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Categories</h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setSelectedCategoryId("All")}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        selectedCategoryId === "All"
                          ? "bg-[var(--color-darkgreen)] text-white shadow-md"
                          : "text-gray-600 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.categoryId}>
                      <button
                        onClick={() => setSelectedCategoryId(cat.categoryId)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                          String(selectedCategoryId) === String(cat.categoryId)
                            ? "bg-[var(--color-darkgreen)] text-white shadow-md"
                            : "text-gray-600 hover:bg-white hover:shadow-sm"
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
            
            <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
              <p className="text-gray-500 font-medium">
                Showing <span className="font-bold text-[var(--color-darkgreen)]">{processedProducts.length}</span> results
              </p>

              <button 
                  className="md:hidden flex items-center gap-2 px-5 py-2 bg-[var(--color-darkgreen)] text-white rounded-full shadow-md text-sm font-bold"
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
              >
                  <Filter size={16} /> Filter Categories
              </button>
            </div>

            {processedProducts.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-xl text-gray-400 mb-4">No products found here.</p>
                <button 
                  onClick={() => setSelectedCategoryId("All")}
                  className="text-[var(--color-orange)] font-bold hover:underline text-lg mt-4"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {processedProducts.map((product) => (
                  <div
                    key={product.productId}
                    className="group cursor-pointer flex flex-col items-center"
                    onClick={() => navigate(`/product/${product.productId}`)}
                  >
                    
                    <div className="
                        relative w-full aspect-[1/1.1] bg-gray-50 rounded-[2rem] overflow-hidden 
                        border border-gray-400 transition-all duration-500 h-[200px] md:h-[340px]
                        group-hover:border-[var(--color-orange)] group-hover:shadow-xl
                    ">
                      <img
                        src={getProductImage(product.image || product.images?.[0])}
                        alt={product.productName}
                        className="w-full h-full object-cover p-0 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = "/assets/placeholder.webp"; }}
                      />

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="
                          absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-12 
                          bg-[var(--color-darkgreen)] text-white px-6 py-2.5 rounded-full 
                          font-bold text-sm shadow-md opacity-0 
                          group-hover:translate-y-0 group-hover:opacity-100 
                          transition-all duration-300 hover:bg-[var(--color-orange)]
                          hidden md:block whitespace-nowrap
                        "
                      >
                        Add to Cart
                      </button>
                      
                      <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="md:hidden absolute bottom-3 right-3 bg-[var(--color-darkgreen)] text-white p-2 rounded-full shadow-md"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                      </button>
                    </div>

                    <div className="mt-4 text-center px-1 w-full"> 
                      <h3 className="text-lg font-heading font-bold text-gray-800 group-hover:text-[var(--color-darkgreen)] transition-colors leading-tight">
                        {product.productName}
                      </h3>
                      
                      <div className="mt-1 flex items-center justify-center gap-2">
                        {product.specialPrice && product.specialPrice < product.price ? (
                          <>
                             <span className="text-gray-400 text-sm line-through font-body">₹{product.price}</span>
                             <span className="text-[var(--color-orange)] font-bold text-lg font-body">₹{product.specialPrice}</span>
                          </>
                        ) : (
                          <span className="text-gray-800 font-bold text-lg font-body">₹{product.price}</span>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;