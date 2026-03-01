import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// 1. Fetch All Coupons
export const fetchCoupons = createAsyncThunk(
  'coupons/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Matches @RequestMapping("/api/admin/coupons")
      const response = await api.get('/admin/coupons'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load coupons");
    }
  }
);

// 2. Create Coupon
export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (couponData, { rejectWithValue }) => {
    try {
      // ✅ Matches @PostMapping in CouponController
      const response = await api.post('/admin/coupons', couponData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create coupon");
    }
  }
);

// 3. Delete Coupon
export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (couponId, { rejectWithValue }) => {
    try {
      // ✅ Matches @DeleteMapping("/{couponId}")
      await api.delete(`/admin/coupons/${couponId}`);
      return couponId; // Return ID to filter it out from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete coupon");
    }
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch ---
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create ---
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.push(action.payload); // Add new coupon to UI instantly
      })

      // --- Delete ---
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c.couponId !== action.payload);
      });
  },
});

export default couponSlice.reducer;