import React, { useState, useEffect } from "react";
import api from "../../apis/axiosConfig"; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// ✅ Import from productSlice (The consolidated slice)
import { createProduct, uploadProductImage } from "../../redux/slices/productSlice"; 
import { FaCloudUploadAlt, FaExclamationCircle } from "react-icons/fa";

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use product slice loading state
  const { loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    productName: "", price: "", discount: "", description: "", quantity: "", specialPrice: ""
  });
  
  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Category State
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/public/categories");
        const list = response.data.content || response.data || [];
        setCategories(list);
        // Auto-select first category if exists
        if (list.length > 0) setCategoryId(list[0].categoryId);
      } catch (error) {
        console.warn("Category load issue (might be empty):", error);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB Check
          toast.error("File too large. Max 10MB");
          return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Please select a category");

    try {
      // Step 1: Create Product
      const newProduct = await dispatch(createProduct({ categoryId, productData: formData })).unwrap();
      
      // Step 2: Upload Image (Only if selected)
      if (imageFile && newProduct?.productId) {
         try {
             await dispatch(uploadProductImage({ 
                 productId: newProduct.productId, 
                 file: imageFile 
             })).unwrap();
         } catch (imgErr) {
             toast.warning("Product created, but image upload failed.");
         }
      }

      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to create product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/products" className="text-gray-500 hover:text-[var(--color-orange)] mb-6 inline-block font-bold transition-colors">
          &larr; Back to Products
        </Link>
        
        <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] mb-8 font-heading">Add New Product</h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="md:grid md:grid-cols-3 md:divide-x divide-gray-200">
            
            {/* Left: Inputs */}
            <div className="p-8 md:col-span-2 space-y-6">
              <form id="create-form" onSubmit={submitHandler}>
                
                {/* Name */}
                <div>
                    <label className="label">Product Name</label>
                    <input name="productName" type="text" className="input-field" placeholder="e.g. Premium Yerba Mate" onChange={handleChange} required />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="label">Price ($)</label>
                       <input name="price" type="number" className="input-field" placeholder="0.00" onChange={handleChange} required />
                    </div>
                    <div>
                       <label className="label">Stock</label>
                       <input name="quantity" type="number" className="input-field" placeholder="100" onChange={handleChange} required />
                    </div>
                </div>

                {/* Category Dropdown */}
                <div>
                    <label className="label">Category</label>
                    {categories.length === 0 && !loadingCats ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-center gap-2">
                            <FaExclamationCircle /> 
                            <span>No categories found. <Link to="/admin/categories" className="underline font-bold">Create one here.</Link></span>
                        </div>
                    ) : (
                        <select 
                            className="input-field bg-white" 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={loadingCats}
                            required
                        >
                          {loadingCats && <option>Loading...</option>}
                          {categories.map(cat => (
                              <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                          ))}
                        </select>
                    )}
                </div>

                {/* Image Upload */}
                <div>
                    <label className="label">Product Image</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                            <FaCloudUploadAlt /> Choose File
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded-md border border-gray-300" />
                        )}
                        <span className="text-sm text-gray-500">{imageFile ? imageFile.name : "Max 10MB"}</span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="label">Description</label>
                    <textarea name="description" rows="4" className="input-field" placeholder="Describe your product..." onChange={handleChange} required ></textarea>
                </div>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="p-8 bg-gray-50 flex flex-col justify-between">
               <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800">Pricing Strategy</h3>
                  <div>
                      <label className="label">Discount (%)</label>
                      <input name="discount" type="number" className="input-field" placeholder="0" onChange={handleChange} />
                  </div>
                  <div>
                      <label className="label">Special Price</label>
                      <input name="specialPrice" type="number" className="input-field" placeholder="Optional" onChange={handleChange} />
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">Final Price:</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      ${formData.price ? (formData.price - (formData.price * (formData.discount || 0) / 100)).toFixed(2) : "0.00"}
                    </p>
                  </div>
               </div>

               <button
                  form="create-form"
                  type="submit"
                  disabled={loading || categories.length === 0}
                  className="w-full mt-8 bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {loading ? "Creating..." : "Publish Product"}
               </button>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
      `}</style>
    </div>
  );
};

export default ProductCreatePage;