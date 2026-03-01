import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { FaCloudUploadAlt, FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

// React Quill
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Actions
import { 
  fetchProductDetails, 
  updateProduct, 
  uploadProductImage,
  deleteProductImage,
  fetchAllProducts // ✅ ADD THIS: To refresh list after save
} from "../../redux/slices/productSlice"; 

// ✅ FIX 1: Define API URL for Live Server
const API_BASE_URL = "https://matessa.in";

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form Data
  const [formData, setFormData] = useState({
    productName: "", 
    price: "", 
    discount: "", 
    quantity: "", 
    description: "",
    specialPrice: ""
  });
  
  // Conditional Data
  const [variants, setVariants] = useState([]); 
  const [flavors, setFlavors] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Redux State
  const { selectedProduct, loading: productLoading } = useSelector((state) => state.products);

  // 1. Fetch Product
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [productId, dispatch]);

  // 2. Populate Form
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        productName: selectedProduct.productName || "",
        price: selectedProduct.price || 0,
        discount: selectedProduct.discount || 0,
        quantity: selectedProduct.quantity || 0,
        description: selectedProduct.description || "",
        specialPrice: selectedProduct.specialPrice || 0
      });

      const catId = selectedProduct.category?.categoryId || selectedProduct.categoryId;
      setCurrentCategoryId(catId);

      setVariants(selectedProduct.variants || []);
      setFlavors(selectedProduct.flavors || []);
    }
  }, [selectedProduct]);

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // Variants & Flavors
  const addVariant = () => setVariants([...variants, { name: "", price: "", stock: "" }]);
  const removeVariant = (idx) => setVariants(variants.filter((_, i) => i !== idx));
  const handleVariantChange = (idx, field, val) => {
      const list = [...variants];
      list[idx][field] = val;
      setVariants(list);
  };

  const addFlavor = () => setFlavors([...flavors, { flavorName: "", targetProductId: "", colorCode: "#F3CB57" }]);
  const removeFlavor = (idx) => setFlavors(flavors.filter((_, i) => i !== idx));
  const handleFlavorChange = (idx, field, val) => {
      const list = [...flavors];
      list[idx][field] = val;
      setFlavors(list);
  };

  // Image Selection (New File)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return toast.error("File too large (>10MB)");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Helper to get Image URL (Fixes Localhost issue)
  const getImageUrl = (imgName) => {
      if(!imgName) return "";
      if(imgName.startsWith("http")) return imgName;
      return `${API_BASE_URL}/images/${imgName}`;
  };

  // --- ACTIONS ---

  const handleDeleteExistingImage = async (fileName) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await dispatch(deleteProductImage({ productId, fileName })).unwrap();
      toast.success("Image deleted successfully");
      dispatch(fetchProductDetails(productId));
    } catch (error) {
      toast.error(error || "Failed to delete image");
    }
  };
  
  const handleUploadImage = async () => {
    if (!imageFile) return toast.warning("Please select an image first");
    setUploading(true);
    try {
      await dispatch(uploadProductImage({ productId, file: imageFile })).unwrap();
      toast.success("Image uploaded successfully!");
      setImageFile(null); 
      setImagePreview(null);
      dispatch(fetchProductDetails(productId)); 
    } catch (error) {
      const errMsg = typeof error === 'string' ? error : (error?.message || "Failed to upload image");
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        quantity: parseInt(formData.quantity),
        specialPrice: parseFloat(formData.specialPrice) || 0,
        
        variants: variants.map(v => ({
            ...v, price: parseFloat(v.price), stock: parseInt(v.stock)
        })),
        flavors: flavors.map(f => ({
            ...f, targetProductId: parseInt(f.targetProductId) || 0 // Handle NaN
        }))
    };

    try {
      // 1. Update Product
      await dispatch(updateProduct({ productId, productData: payload })).unwrap();
      toast.success("Product updated successfully");

      // ✅ FIX 2: Force Refresh the List so Admin Panel isn't stale
      await dispatch(fetchAllProducts());

      navigate("/admin/products");
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  if (productLoading && !selectedProduct) return <div className="text-center py-20 font-bold text-gray-500">Loading Product...</div>;

  const isSpecialCategory = currentCategoryId === 1; 

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] font-heading">Edit Product</h1>
            <Link to="/admin/products" className="text-gray-500 hover:text-[var(--color-orange)] font-bold flex items-center gap-2 transition-colors">
                <FaArrowLeft /> Back to List
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Image Management */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Media Gallery</h3>
                
                {/* ✅ EXISTING IMAGES GRID */}
                {selectedProduct?.images && selectedProduct.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {selectedProduct.images.map((imgName, index) => (
                            <div key={index} className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-50">
                                <img
                                    // ✅ FIX 3: Use the Helper Function (No Localhost)
                                    src={getImageUrl(imgName)}
                                    alt={`Product ${index}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Img"}
                                />
                                {/* Overlay Delete Button */}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteExistingImage(imgName)}
                                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                >
                                    <FaTrash size={16} className="hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 mb-4 italic">No images uploaded yet.</p>
                )}

                <div className="border-t border-gray-100 my-4 pt-4"></div>

                {/* NEW IMAGE UPLOAD PREVIEW */}
                <h4 className="text-sm font-bold text-gray-600 mb-2 text-left">Upload New Image</h4>
                <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                   {imagePreview ? (
                      <img src={imagePreview} alt="New Selection" className="w-full h-full object-contain" />
                   ) : (
                      <span className="text-gray-400 text-xs">Preview New Image</span>
                   )}
                </div>

                <div className="mb-4">
                   <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                   <label htmlFor="img-upload" className="block w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300 font-medium transition-colors text-sm">
                      {imageFile ? "Change Selection" : "Select File"}
                   </label>
                   {imageFile && <p className="text-xs text-gray-500 mt-2 truncate">{imageFile.name}</p>}
                </div>

                {imageFile && (
                    <button onClick={handleUploadImage} disabled={uploading} className="w-full py-3 bg-[var(--color-orange)] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                       {uploading ? "Uploading..." : <><FaCloudUploadAlt /> Upload Selected</>}
                    </button>
                )}
             </div>
          </div>

          {/* RIGHT COLUMN: Edit Form */}
          <div className="lg:col-span-2">
             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Basic Info */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Product Name</label>
                            <input name="productName" type="text" className="input-field" value={formData.productName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="label">Stock Quantity</label>
                            <input name="quantity" type="number" className="input-field" value={formData.quantity} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">Base Price ($)</label>
                            <input name="price" type="number" className="input-field" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="label">Discount (%)</label>
                            <input name="discount" type="number" className="input-field" value={formData.discount} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label">Special Price</label>
                            <input name="specialPrice" type="number" className="input-field" value={formData.specialPrice} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="label font-body">Description</label>
                        <ReactQuill 
                            theme="snow"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            modules={quillModules}
                            className="bg-white rounded-lg h-48 mb-12 font-body"
                        />
                    </div>
                </div>

                {/* 2. DYNAMIC SECTIONS */}
                {isSpecialCategory && (
                   <>
                      {/* Weight Variants */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in mt-8">
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                              <h3 className="text-lg font-bold text-gray-800">Weight Variations</h3>
                              <button type="button" onClick={addVariant} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-bold">
                                  <FaPlus size={10} /> Add
                              </button>
                          </div>
                          <div className="space-y-3">
                              {variants.map((v, i) => (
                                  <div key={i} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <div className="flex-1"><label className="sub-label">Name</label><input type="text" value={v.name} onChange={(e)=>handleVariantChange(i,'name',e.target.value)} className="mini-input"/></div>
                                      <div className="w-24"><label className="sub-label">Price</label><input type="number" value={v.price} onChange={(e)=>handleVariantChange(i,'price',e.target.value)} className="mini-input"/></div>
                                      <div className="w-20"><label className="sub-label">Stock</label><input type="number" value={v.stock} onChange={(e)=>handleVariantChange(i,'stock',e.target.value)} className="mini-input"/></div>
                                      <button type="button" onClick={() => removeVariant(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><FaTrash size={14}/></button>
                                  </div>
                              ))}
                              {variants.length === 0 && <p className="text-sm text-gray-400 italic">No variations.</p>}
                          </div>
                      </div>

                      {/* Flavors */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                              <h3 className="text-lg font-bold text-gray-800">Flavor Links</h3>
                              <button type="button" onClick={addFlavor} className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100 flex items-center gap-1 font-bold">
                                  <FaPlus size={10} /> Add
                              </button>
                          </div>
                          <div className="space-y-3">
                              {flavors.map((f, i) => (
                                  <div key={i} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <div className="flex-1"><label className="sub-label">Name</label><input type="text" value={f.flavorName} onChange={(e)=>handleFlavorChange(i,'flavorName',e.target.value)} className="mini-input"/></div>
                                      <div className="w-24"><label className="sub-label">Target ID</label><input type="number" value={f.targetProductId} onChange={(e)=>handleFlavorChange(i,'targetProductId',e.target.value)} className="mini-input"/></div>
                                      <div className="w-16"><label className="sub-label">Color</label><input type="color" value={f.colorCode} onChange={(e)=>handleFlavorChange(i,'colorCode',e.target.value)} className="h-8 w-full cursor-pointer"/></div>
                                      <button type="button" onClick={() => removeFlavor(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><FaTrash size={14}/></button>
                                  </div>
                              ))}
                              {flavors.length === 0 && <p className="text-sm text-gray-400 italic">No flavor links.</p>}
                          </div>
                      </div>
                   </>
                )}

                <div className="flex justify-end gap-4 pt-4">
                   <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                   <button type="submit" disabled={productLoading} className="bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                      <FaSave /> {productLoading ? "Saving..." : "Update Product"}
                   </button>
                </div>
             </form>
          </div>

        </div>
      </div>
     <style>{`
    .label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.3rem; }
    .sub-label { display: block; font-size: 0.75rem; font-weight: 600; color: #6B7280; margin-bottom: 0.25rem; }
    .input-field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; transition: all 0.2s; }
    .mini-input { width: 100%; padding: 0.5rem; border: 1px solid #E5E7EB; border-radius: 0.375rem; font-size: 0.875rem; outline: none; }
    .input-field:focus, .mini-input:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* ✅ FORCE EDITOR TO BEHAVE NORMALLY */
    .ql-container { min-height: 120px; font-size: 1rem; font-family: inherit; }
    .ql-editor {
        white-space: normal !important; 
        word-break: normal !important;
        overflow-wrap: break-word !important;
    }
    .ql-editor p { margin-bottom: 1em; }
`}</style>
    </div>
  );
};

export default ProductEditPage;