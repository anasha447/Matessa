import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// ==============================
// 1. PLACE ORDER (Checkout)
// ==============================
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async ({ paymentMode, orderRequest }, { rejectWithValue }) => {
    try {
      // Endpoint: POST /api/public/order/users/payments/{paymentMode}
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
      // Endpoint: GET /api/orders/myorders
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
      // Endpoint: GET /api/admin/orders
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
      const response = await api.get(`/orders/${orderId}`);
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
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
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
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Place Order ---
      .addCase(placeOrder.pending, (state) => { state.loading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload; // Store newly created order
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
      });
  },
});

export default orderSlice.reducer;