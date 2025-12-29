import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ==============================
// 1. PLACE ORDER (Checkout)
// ==============================
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ paymentMode, orderRequest }, { rejectWithValue }) => {
    try {
      // ✅ FIX: Matches @PostMapping("/public/order/users/payments/{paymentMode}")
      const response = await api.post(
        `/public/order/users/payments/${paymentMode}`, 
        orderRequest
      );
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to place order");
    }
  }
);

// ==============================
// 2. FETCH MY ORDERS (User History)
// ==============================
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      // Note: This endpoint wasn't in your snippet, assuming it exists at /api/orders/myorders
      const response = await api.get('/orders/myorders');
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// ==============================
// 3. FETCH ALL ORDERS (Admin)
// ==============================
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ FIX: Matches @GetMapping("/admin/orders") under /api
      // Removed '/public' because your new controller uses @RequestMapping("/api")
      const response = await api.get('/admin/orders');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load orders");
    }
  }
);

// ==============================
// 4. FETCH SINGLE ORDER DETAILS
// ==============================
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      // ✅ FIX: Matches @GetMapping("/public/orders/{orderId}")
      const response = await api.get(`/public/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Order not found");
    }
  }
);

// ==============================
// 5. UPDATE ORDER STATUS (Admin)
// ==============================
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      // ✅ CORRECT: Sends JSON Body { "status": "Shipped" }
      const response = await api.put(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

// ==============================
// 6. TRACK ORDER (Guest/Public)
// ==============================
export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (email, { rejectWithValue }) => {
    try {
      // ✅ FIX: Matches @GetMapping("/public/orders/track")
      const response = await api.get(`/public/orders/track?email=${email}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Tracking failed");
    }
  }
);

// ==============================
// SLICE
// ==============================
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],       // Admin: All orders
    myOrders: [],     // User: Order History
    currentOrder: null, // Details for single order page
    trackingResult: null, // Stores tracking search results
    loading: false,
    error: null,
  },
  reducers: {
    clearTracking: (state) => {
      state.trackingResult = null;
      state.error = null;
    },
    // Optional: Reset state when leaving checkout
    resetOrderState: (state) => {
      state.loading = false;
      state.error = null;
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Place Order ---
      .addCase(placeOrder.pending, (state) => { state.loading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload; 
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch My Orders ---
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch All (Admin) ---
      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Single Details ---
      .addCase(fetchOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Update Status (Admin) ---
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.orderId === action.payload.orderId);
        if (index !== -1) {
           // 
           // Merge the new data with existing data to prevent losing fields like 'payment'
           state.orders[index] = { ...state.orders[index], ...action.payload };
        }
      })
      // --- Track Order ---
      .addCase(trackOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.trackingResult = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.trackingResult = null;
      });
  },
});

export const { clearTracking, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;