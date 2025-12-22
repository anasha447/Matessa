import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ==============================
// 1. FETCH ALL USERS (List Page)
// ==============================
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Endpoint: GET /api/admin/users
      const response = await api.get('/admin/users');
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

// ==============================
// 2. DELETE USER (List Page)
// ==============================
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId, { rejectWithValue }) => {
    try {
      // Endpoint: DELETE /api/admin/users/{id}
      await api.delete(`/admin/users/${userId}`);
      return userId; // Return ID to remove it from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

// ==============================
// 3. FETCH USER DETAILS (Edit Page)
// ==============================
export const fetchUserDetails = createAsyncThunk(
  'users/fetchDetails',
  async (userId, { rejectWithValue }) => {
    try {
      // Endpoint: GET /api/admin/users/{id}
      const response = await api.get(`/admin/users/${userId}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
    }
  }
);

// ==============================
// 4. UPDATE USER (Edit Page)
// ==============================
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      // Endpoint: PUT /api/admin/users/{id}
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

// ==============================
// SLICE
// ==============================
const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],        // List of all users
    userDetails: null, // Details of single user (for editing)
    loading: false,
    error: null,
  },
  reducers: {
    clearUserDetails: (state) => {
      state.userDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch All ---
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Delete ---
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.userId !== action.payload && user._id !== action.payload);
      })

      // --- Fetch Single Details ---
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Update ---
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
        state.userDetails = null; // Clear details on success
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserDetails } = userSlice.actions;
export default userSlice.reducer;