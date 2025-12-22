import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ==============================
// ASYNC ACTIONS
// ==============================

// 1. Fetch All Categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/public/categories');
      
      // Handle Spring Boot "Page" response vs List response
      if (response.data && response.data.content) {
          return response.data.content;
      }
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load categories");
    }
  }
);

// 2. Create Category (Admin)
export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData, { rejectWithValue }) => {
    try {
      // ✅ Matches Controller: @PostMapping("/admin/public/categories")
      const response = await api.post('/admin/public/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);

// 3. Update Category (Admin)
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      // ✅ Matches Controller: @PutMapping("/admin/categories/{categoryId}")
      const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category");
    }
  }
);

// 4. Delete Category (Admin)
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (categoryId, { rejectWithValue }) => {
    try {
      // ✅ Matches Controller: @DeleteMapping("/admin/categories/{categoryId}")
      await api.delete(`/admin/categories/${categoryId}`);
      return categoryId; // Return ID to filter it out of state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete category");
    }
  }
);

// ==============================
// SLICE
// ==============================

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCategoryMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create ---
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.successMessage = "Category created successfully";
      })

      // --- Update ---
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = "Category updated successfully";
      })

      // --- Delete ---
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(cat => cat.categoryId !== action.payload);
        state.successMessage = "Category deleted successfully";
      })

      // --- Global Loading/Error for Admin Actions ---
      .addMatcher(
        (action) => action.type.startsWith('categories/') && (action.type.endsWith('/create/pending') || action.type.endsWith('/delete/pending') || action.type.endsWith('/update/pending')),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith('categories/') && action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      )
      .addMatcher(
        (action) => action.type.startsWith('categories/') && action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      );
  },
});

export const { clearCategoryMessages } = categorySlice.actions;
export default categorySlice.reducer;