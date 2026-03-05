import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

// ✅ FIX: Import 'createCategory' (not addCategory)
import { 
  fetchCategories, 
  createCategory, // <--- CHANGED THIS NAME
  updateCategory, 
  deleteCategory, 
  clearCategoryMessages 
} from "../redux/slices/categorySlice";

const CategoryManagementPage = () => {
  const dispatch = useDispatch();
  
  // Get state from 'categories' slice
  const { items: categories, loading, error, successMessage } = useSelector((state) => state.categories);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ categoryName: "" });

  // 1. Fetch on Mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 2. Handle Success/Error Messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setFormData({ categoryName: "" }); 
      setEditingId(null); 
      dispatch(clearCategoryMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearCategoryMessages());
    }
  }, [successMessage, error, dispatch]);

  // 3. Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) return toast.warning("Category name is required");

    if (editingId) {
      dispatch(updateCategory({ categoryId: editingId, categoryData: formData }));
    } else {
      // ✅ FIX: Dispatch 'createCategory'
      dispatch(createCategory(formData));
    }
  };

  // 4. Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Delete this category? Products in this category might be affected.")) {
      dispatch(deleteCategory(id));
    }
  };

  const startEdit = (category) => {
    setEditingId(category.categoryId);
    setFormData({ categoryName: category.categoryName });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ categoryName: "" });
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-[var(--color-darkgreen)] mb-8 font-heading text-center">
        Manage Categories
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* LEFT: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {editingId ? <FaEdit className="text-blue-500" /> : <FaPlus className="text-green-500" />}
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="e.g. Yerba Mate Sets"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-bold transition-transform active:scale-95 ${
                    editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-[var(--color-darkgreen)] hover:bg-green-900"
                  }`}
                >
                  {loading ? "Saving..." : (editingId ? "Update" : "Add")}
                </button>
                
                {editingId && (
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(categories) && categories.length > 0 ? categories.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{cat.categoryId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{cat.categoryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => startEdit(cat)} 
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.categoryId)} 
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                      {loading ? "Loading categories..." : "No categories found. Create one to get started!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagementPage;