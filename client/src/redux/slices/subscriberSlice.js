import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// ==========================================
// 1. ASYNC ACTIONS (THUNKS)
// ==========================================

// ✅ User: Subscribe (Public)
export const subscribeUser = createAsyncThunk(
  'subscriber/subscribe',
  async (email, { rejectWithValue }) => {
    try {
      // Calls: POST /api/public/subscribe
      const response = await api.post('/public/subscribe', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Subscription failed");
    }
  }
);

// ✅ Admin: Fetch All Subscribers
export const fetchSubscribers = createAsyncThunk(
  'subscriber/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Calls: GET /api/public/admin/subscribers
      // (Based on your controller mapping: @RequestMapping("/api/public") + @GetMapping("/admin/subscribers"))
      const response = await api.get('/public/admin/subscribers');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load subscribers");
    }
  }
);

// ==========================================
// 2. THE SLICE
// ==========================================

const subscriberSlice = createSlice({
  name: 'subscriber',
  initialState: {
    subscribers: [], // ✅ Stores the list for Admin Page
    loading: false,
    success: false,  // Tracks successful subscription
    error: null,
  },
  reducers: {
    resetSubscriber: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Subscribe User ---
      .addCase(subscribeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true; // Trigger success UI (Show Coupon)
      })
      .addCase(subscribeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Subscribers (Admin) ---
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.loading = false;
        state.subscribers = action.payload; // ✅ Save list to state
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubscriber } = subscriberSlice.actions;
export default subscriberSlice.reducer;