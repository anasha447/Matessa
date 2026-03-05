import React, { useState, useEffect } from "react";
import api from "../../apis/axiosConfig"; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, uploadProductImage } from "../../redux/slices/productSlice"; 
import { FaCloudUploadAlt, FaExclamationCircle, FaTag, FaPlus, FaTrash, FaLink } from "react-icons/fa";

// ✅ 1. Import React Quill and its CSS
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading } = useSelector((state) => state.products);

  // ✅ Main Form Data
  const [formData, setFormData] = useState({
    productName: "", 
    price: "", 
    discount: "", 
    description: "", // Now stores HTML string from Quill
    quantity: "", 
    specialPrice: "" 
  });

  const [variants, setVariants] = useState([]); 
  const [flavors, setFlavors] = useState([]);   
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/public/categories");
        const list = response.data.content || response.data || [];
        setCategories(list);
        if (list.length > 0) setCategoryId(list[0].categoryId);
      } catch (error) {
        console.warn("Category load issue:", error);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ 2. Special Handler for Quill (it returns value directly, not an event)
  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // --- VARIANT HANDLERS ---
  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };
  const removeVariant = (index) => {
    const list = [...variants];
    list.splice(index, 1);
    setVariants(list);
  };
  const handleVariantChange = (index, field, value) => {
    const list = [...variants];
    list[index][field] = value;
    setVariants(list);
  };

  // --- FLAVOR HANDLERS ---
  const addFlavor = () => {
    setFlavors([...flavors, { flavorName: "", targetProductId: "", colorCode: "#F3CB57" }]);
  };
  const removeFlavor = (index) => {
    const list = [...flavors];
    list.splice(index, 1);
    setFlavors(list);
  };
  const handleFlavorChange = (index, field, value) => {
    const list = [...flavors];
    list[index][field] = value;
    setFlavors(list);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return toast.error("File too large. Max 10MB");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!categoryId) return toast.error("Please select a category");
    // Basic validation for description
    if (!formData.description || formData.description.replace(/<[^>]*>/g, '').trim().length < 10) {
        return toast.error("Description must be at least 10 characters long");
    }

    const finalPayload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0.0,
        discount: formData.discount ? parseFloat(formData.discount) : 0.0,
        quantity: formData.quantity ? parseInt(formData.quantity) : 0,
        specialPrice: formData.specialPrice ? parseFloat(formData.specialPrice) : 0.0,
        variants: variants.map(v => ({
            name: v.name || "Default",
            price: v.price ? parseFloat(v.price) : 0.0,
            stock: v.stock ? parseInt(v.stock) : 0
        })),
        flavors: flavors.map(f => ({
            flavorName: f.flavorName || "Flavor",
            targetProductId: f.targetProductId ? parseInt(f.targetProductId) : 0,
            colorCode: f.colorCode || "#000000"
        }))
    };

    try {
      const newProduct = await dispatch(createProduct({ categoryId, productData: finalPayload })).unwrap();
      
      if (imageFile && newProduct?.productId) {
         try {
             await dispatch(uploadProductImage({ productId: newProduct.productId, file: imageFile })).unwrap();
         } catch (imgErr) {
             const warningMsg = typeof imgErr === 'string' ? imgErr : (imgErr?.message || "Product created, but image upload failed.");
             toast.warning(warningMsg);
         }
      }

      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (error) {
      const errMsg = typeof error === 'string' ? error : (error?.response?.data?.message || error?.message || "Failed to create product");
      toast.error(errMsg);
    }
  };

  // ✅ 3. Configure Quill Toolbar Options
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],        // toggled buttons
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']                               // remove formatting button
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto"> 
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <Link to="/admin/products" className="text-gray-500 hover:text-[var(--color-orange)] font-bold transition-colors">
              &larr; Back to Products
            </Link>
            <Link to="/admin/coupons" className="flex items-center gap-2 bg-white text-[var(--color-darkgreen)] border border-gray-200 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-all">
               <FaTag /> Manage Coupons
            </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] mb-8 font-heading">Add New Product</h1>

        <form id="create-form" onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: BASIC INFO --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. General Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Basic Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Product Name</label>
                            <input name="productName" type="text" className="input-field" placeholder="e.g. Lemon Ginger Mate" onChange={handleChange} required />
                        </div>
                        
                        {/* ✅ 4. Replaced Textarea with ReactQuill */}
                        <div className="mb-4">
                            <label className="label">Description</label>
                            <ReactQuill 
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                modules={quillModules}
                                className="bg-white rounded-lg h-48 mb-12" // mb-12 adds space for the toolbar
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8"> {/* Added top margin to clear Quill */}
                            <div>
                                <label className="label">Base Price (₹)</label>
                                <input name="price" type="number" className="input-field" placeholder="400.00" onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="label">Total Stock</label>
                                <input name="quantity" type="number" className="input-field" placeholder="100" onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                             <label className="label">Category</label>
                             <select className="input-field bg-white" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loadingCats}>
                                {Array.isArray(categories) && categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>)}
                             </select>
                        </div>
                    </div>
                </div>

                {/* 2. VARIATIONS SECTION (Internal) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Weight Variations <span className="text-xs font-normal text-gray-500">(Optional)</span></h3>
                        <button type="button" onClick={addVariant} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-bold">
                            <FaPlus size={10} /> Add Variant
                        </button>
                    </div>
                    
                    {variants.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No variations added. Using base product only.</p>
                    ) : (
                        <div className="space-y-3">
                            {variants.map((variant, index) => (
                                <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500">Name (e.g. 100g)</label>
                                        <input type="text" value={variant.name} onChange={(e) => handleVariantChange(index, "name", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="100g" />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold text-gray-500">Price (₹)</label>
                                        <input type="number" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="400" />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-xs font-bold text-gray-500">Stock</label>
                                        <input type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="50" />
                                    </div>
                                    <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition"><FaTrash size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. FLAVORS SECTION (External Links) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Flavor Links <span className="text-xs font-normal text-gray-500">(Optional)</span></h3>
                        <button type="button" onClick={addFlavor} className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100 flex items-center gap-1 font-bold">
                            <FaPlus size={10} /> Add Link
                        </button>
                    </div>
                    
                    {flavors.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No other flavors linked.</p>
                    ) : (
                        <div className="space-y-3">
                            {flavors.map((flavor, index) => (
                                <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500">Flavor Name</label>
                                        <input type="text" value={flavor.flavorName} onChange={(e) => handleFlavorChange(index, "flavorName", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Masala" />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs font-bold text-gray-500">Target ID</label>
                                        <input type="number" value={flavor.targetProductId} onChange={(e) => handleFlavorChange(index, "targetProductId", e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="ID" />
                                    </div>
                                    <div className="w-16">
                                        <label className="text-xs font-bold text-gray-500">Color</label>
                                        <input type="color" value={flavor.colorCode} onChange={(e) => handleFlavorChange(index, "colorCode", e.target.value)} className="w-full h-8 border rounded cursor-pointer p-0.5" />
                                    </div>
                                    <button type="button" onClick={() => removeFlavor(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-md transition"><FaTrash size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT COLUMN: IMAGE & SETTINGS --- */}
            <div className="space-y-6">
                
                {/* Image Upload */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Product Image</h3>
                    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-40 w-full object-contain rounded-md" />
                        ) : (
                            <FaCloudUploadAlt className="text-gray-300 text-5xl" />
                        )}
                        <label className="cursor-pointer bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm transition-colors w-full text-center">
                            Choose File
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        <span className="text-xs text-gray-400">{imageFile ? imageFile.name : "Max 10MB"}</span>
                    </div>
                </div>

                {/* Pricing Strategy */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Pricing Strategy</h3>
                    <div className="space-y-4">
                        <div>
                             <label className="label">Discount (%) <span className="text-gray-400 font-normal">- Optional</span></label>
                             <input name="discount" type="number" className="input-field" placeholder="0" onChange={handleChange} />
                        </div>
                        <div>
                             <label className="label">Special Price <span className="text-gray-400 font-normal">- Optional</span></label>
                             <input name="specialPrice" type="number" className="input-field" placeholder="Override calculated price" onChange={handleChange} />
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                            <p className="text-xs text-green-800 font-bold uppercase">Estimated Final Price</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">
                              ₹{formData.price ? (formData.price - (formData.price * (formData.discount || 0) / 100)).toFixed(2) : "0.00"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                 type="submit"
                 disabled={loading || !Array.isArray(categories) || categories.length === 0}
                 className="w-full bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? "Creating..." : "Publish Product"}
                </button>
            </div>
        </form>
      </div>
      
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E7EB; border-radius: 0.5rem; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
        /* Quill override for better visibility */
        .ql-container { min-height: 120px; font-size: 1rem; }
        .ql-editor { min-height: 120px; }
      `}</style>
    </div>
  );
};

export default ProductCreatePage;