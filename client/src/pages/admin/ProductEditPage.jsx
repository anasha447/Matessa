import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { FaCloudUploadAlt, FaSave, FaArrowLeft } from "react-icons/fa";

// ✅ Import all actions from productSlice
import { 
  fetchProductDetails, 
  updateProduct, 
  uploadProductImage 
} from "../../redux/slices/productSlice"; 

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    productName: "", 
    price: 0, 
    discount: 0, 
    quantity: 0, 
    description: "",
    specialPrice: 0
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get State
  const { selectedProduct, loading: productLoading } = useSelector((state) => state.products);

  // 1. Fetch Product on Mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [productId, dispatch]);

  // 2. Populate Form when Product Data Arrives
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
      // Set existing image as preview if no new file selected
      if (!imageFile && selectedProduct.image) {
         setImagePreview(`http://localhost:8080/api/public/images/${selectedProduct.image}`);
      }
    }
  }, [selectedProduct, imageFile]);

  // Handle Input Changes
  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return toast.error("File too large (>10MB)");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ ACTION: Upload Image Only
  const handleUploadImage = async () => {
    if (!imageFile) return toast.warning("Please select an image first");
    
    setUploading(true);
    try {
      await dispatch(uploadProductImage({ productId, file: imageFile })).unwrap();
      toast.success("Image updated successfully!");
      setImageFile(null); // Reset file input
      // Refresh details to sync state
      dispatch(fetchProductDetails(productId)); 
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // ✅ ACTION: Update Product Details
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProduct({ productId, productData: formData })).unwrap();
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  if (productLoading && !selectedProduct) {
      return <div className="text-center py-20 font-bold text-gray-500">Loading Product Details...</div>;
  }

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
                <h3 className="text-lg font-bold text-gray-800 mb-4">Product Image</h3>
                
                <div className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                   {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/300?text=No+Image"; }}
                      />
                   ) : (
                      <span className="text-gray-400">No Image</span>
                   )}
                </div>

                {/* File Input */}
                <div className="mb-4">
                   <input 
                      type="file" 
                      id="img-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange} 
                      disabled={uploading}
                   />
                   <label 
                      htmlFor="img-upload" 
                      className="block w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer border border-gray-300 font-medium transition-colors"
                   >
                      {imageFile ? "Change Selection" : "Select New Image"}
                   </label>
                   {imageFile && <p className="text-xs text-gray-500 mt-2 truncate">{imageFile.name}</p>}
                </div>

                {/* Upload Button */}
                {imageFile && (
                    <button 
                       onClick={handleUploadImage}
                       disabled={uploading}
                       className="w-full py-3 bg-[var(--color-orange)] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                    >
                       {uploading ? "Uploading..." : <><FaCloudUploadAlt /> Upload Now</>}
                    </button>
                )}
             </div>
          </div>

          {/* RIGHT COLUMN: Edit Form */}
          <div className="lg:col-span-2">
             <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                
                {/* Name & Stock */}
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

                {/* Pricing Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="label">Price ($)</label>
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

                {/* Description */}
                <div>
                    <label className="label">Description</label>
                    <textarea name="description" rows="6" className="input-field" value={formData.description} onChange={handleChange} required />
                </div>

                {/* Submit Bar */}
                <div className="pt-4 flex justify-end gap-4 border-t border-gray-100">
                   <button 
                      type="button" 
                      onClick={() => navigate("/admin/products")}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                   >
                      Cancel
                   </button>
                   <button 
                      type="submit" 
                      disabled={productLoading || uploading}
                      className="bg-[var(--color-darkgreen)] hover:bg-green-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                   >
                      <FaSave /> {productLoading ? "Saving..." : "Save Changes"}
                   </button>
                </div>

             </form>
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

export default ProductEditPage;