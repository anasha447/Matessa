import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// ==========================================
// 1. PUBLIC ACTIONS
// ==========================================

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ pageNumber = 0, pageSize = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/public/products`, { params: { pageNumber, pageSize } });
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
      const response = await api.get(`/public/products/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load product");
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/search',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await api.get(`/public/products/keywords/${keyword}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

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
      return response.data;
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
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

// ✅ ACTION: Upload Image (Appends to list)
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file); // Must match Backend @RequestParam("image")

      // ✅ FIX: Explicitly set the header to multipart/form-data
      const response = await api.post(`/admin/products/${productId}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Image upload failed");
    }
  }
);

// ✅ NEW ACTION: Delete Specific Image
export const deleteProductImage = createAsyncThunk(
  'products/deleteImage',
  async ({ productId, fileName }, { rejectWithValue }) => {
    try {
      // Calls: DELETE /api/admin/products/{id}/image/{fileName}
      const response = await api.delete(`/admin/products/${productId}/image/${fileName}`);
      return response.data; // Returns updated ProductDTO
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete image");
    }
  }
);

// ==========================================
// THE SLICE
// ==========================================

// Helper to update local state when a product changes
const updateProductInState = (state, updatedProduct) => {
  const index = state.items.findIndex(p => p.productId === updatedProduct.productId);
  if (index !== -1) {
    state.items[index] = updatedProduct;
  }
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
      .addCase(fetchAllProducts.pending, (state) => { state.loading = true; })
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

      // --- Create Product ---
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // --- Delete Product ---
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p.productId !== action.payload && p._id !== action.payload);
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

      // --- Upload Image ---
      .addCase(uploadProductImage.pending, (state) => { state.loading = true; })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        updateProductInState(state, action.payload);
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Delete Image ---
      .addCase(deleteProductImage.pending, (state) => { state.loading = true; })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false;
        updateProductInState(state, action.payload);
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReviewSuccess } = productSlice.actions;
export default productSlice.reducer;