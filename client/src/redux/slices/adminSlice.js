import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// ==========================================
// 1. DASHBOARD / STATS
// ==========================================
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load stats");
    }
  }
);

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'admin/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to fetch user details");
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

// ==========================================
// 3. PRODUCT MANAGEMENT
// ==========================================

export const createProduct = createAsyncThunk(
  'admin/createProduct',
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
  'admin/updateProduct',
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
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/products/${productId}`);
      return productId; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete product");
    }
  }
);

export const uploadProductImage = createAsyncThunk(
  'admin/uploadProductImage',
  async ({ productId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(`/admin/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { productId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload image");
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  'admin/deleteProductImage',
  async ({ productId, fileName }, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/products/${productId}/image/${fileName}`);
      return { productId, fileName };
    } catch (error) {
      return rejectWithValue("Failed to delete image");
    }
  }
);

// ==========================================
// ADMIN SLICE LOGIC
// ==========================================
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    userDetails: null,
    orders: [],
    products: [], // Ensure products are tracked if needed
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
    clearUserDetails: (state) => { state.userDetails = null; } 
  },
  extraReducers: (builder) => {
    builder
      // --- DASHBOARD ---
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // --- USERS: FETCH ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ CRITICAL FIX: Handles both [Array] and { content: [Array] } (Pagination)
        state.users = Array.isArray(action.payload) 
          ? action.payload 
          : (action.payload.content || []); 
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- USERS: DELETE ---
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.userId !== action.payload);
        state.successMessage = "User deleted successfully";
      })

      // --- USERS: FETCH DETAILS ---
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetails = action.payload;
      })

      // --- USERS: UPDATE ---
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "User updated successfully";
        state.userDetails = null; 
        
        // Optimistic UI Update
        const index = state.users.findIndex(u => u.userId === action.payload.userId);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      // --- PRODUCTS ---
      .addCase(createProduct.fulfilled, (state) => {
        state.successMessage = "Product created successfully";
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.successMessage = "Product updated successfully";
      })
      .addCase(deleteProduct.fulfilled, (state) => {
         state.successMessage = "Product deleted successfully";
      })
      .addCase(uploadProductImage.fulfilled, (state) => {
        state.successMessage = "Image uploaded successfully";
      })

      // --- GLOBAL LOADING HANDLER (Matchers) ---
      // This handles loading/errors for ALL thunks automatically
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith('admin/') && action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearAdminError, clearSuccessMessage, clearUserDetails } = adminSlice.actions;
export default adminSlice.reducer;