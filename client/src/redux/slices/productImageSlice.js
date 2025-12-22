import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ... (your existing fetchProducts thunks, etc.)

// ✅ NEW: Image Upload Thunk
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      // "image" key must match @RequestParam("image") in your Spring Controller
      formData.append("image", file); 

      const response = await api.put(
        `/admin/products/${productId}/image`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Crucial for file uploads
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
        // so the new image shows up without refreshing the page.
        const index = state.items.findIndex(item => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;