import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ... (your existing fetchProducts thunks, etc.)

// ✅ Image Upload Thunk
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      // "image" key must match @RequestParam("image") in your Spring Controller
      formData.append("image", file); 

      const response = await api.post(
        `/admin/products/${productId}/image`, 
        formData,
        {
          headers: {
            // Explicitly tell the backend this is a file, not JSON
            "Content-Type": "multipart/form-data" 
          },
        }
      );
      
      // Returns the updated ProductDTO from backend
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Image upload failed");
    }
  }
);

// ✅ NEW: Image Delete Thunk
export const deleteProductImage = createAsyncThunk(
  'products/deleteImage',
  async ({ productId, fileName }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/products/${productId}/image/${fileName}`);
      
      // Your Spring backend returns the updated ProductDTO after deletion, 
      // so we return it here to instantly update the UI.
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete image");
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ... (your existing reducers for fetch, delete, etc.)

      // ✅ Handle Image Upload Lifecycle
      .addCase(uploadProductImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Find the product in the local state and update it immediately
        const index = state.items.findIndex(item => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Handle Image Delete Lifecycle
      .addCase(deleteProductImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Find the product and update it immediately so the deleted image vanishes from the screen
        const index = state.items.findIndex(item => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;