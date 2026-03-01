import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// ==========================================
// 1. PUBLIC ACTIONS
// ==========================================

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ pageNumber = 0, pageSize = 100 } = {}, { rejectWithValue }) => {
    try {
      // ✅ Cache Buster: Add timestamp to prevent browser caching
      const response = await api.get(`/public/products?_t=${new Date().getTime()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/public/products/${productId}?_t=${new Date().getTime()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load product");
    }
  }
);

// ... (searchProducts, createProductReview remain same) ...

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      await api.post(`/products/${productId}/reviews`, reviewData);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit review");
    }
  }
);


// ==========================================
// 2. ADMIN ACTIONS
// ==========================================

export const createProduct = createAsyncThunk(
  'products/create',
  async ({ categoryId, productData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/categories/${categoryId}/product`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/products/${productId}`, productData);
      return response.data; // Returns updated ProductDTO
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      return productId; // Return ID so we can filter it out
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await api.post(`/admin/products/${productId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Image upload failed");
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  'products/deleteImage',
  async ({ productId, fileName }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/image/${fileName}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete image");
    }
  }
);

// ==========================================
// THE SLICE
// ==========================================

// Helper to update local state (Both List AND Single View)
const updateProductInState = (state, updatedProduct) => {
  // 1. Update in List
  const index = state.items.findIndex(p => p.productId === updatedProduct.productId);
  if (index !== -1) {
    state.items[index] = updatedProduct;
  }
  // 2. Update Single View (if looking at this product)
  if (state.selectedProduct?.productId === updatedProduct.productId) {
    state.selectedProduct = updatedProduct;
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
    reviewSuccess: false,
  },
  reducers: {
    resetReviewSuccess: (state) => {
      state.reviewSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch All ---
      .addCase(fetchAllProducts.pending, (state) => { 
        // Only show spinner if list empty to avoid flicker
        if(state.items.length === 0) state.loading = true; 
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Single ---
      .addCase(fetchProductDetails.pending, (state) => { 
        state.loading = true; 
        state.selectedProduct = null; 
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create ---
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // --- Delete ---
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from list
        state.items = state.items.filter(p => p.productId !== action.payload);
        // If currently viewing deleted product, clear it
        if (state.selectedProduct?.productId === action.payload) {
            state.selectedProduct = null;
        }
      })

      // --- Reviews ---
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewSuccess = true;
      })

      // --- Update Product ---
      .addCase(updateProduct.pending, (state) => { state.loading = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        updateProductInState(state, action.payload);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Image Upload/Delete ---
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        updateProductInState(state, action.payload);
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false;
        updateProductInState(state, action.payload);
      });
  },
});

export const { resetReviewSuccess } = productSlice.actions;
export default productSlice.reducer;