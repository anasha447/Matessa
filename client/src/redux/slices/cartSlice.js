import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// --- A. ASYNC ACTIONS (THUNKS) ---

// 1. Fetch Cart
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            // ✅ FIX 1: Add Timestamp (_t) to prevent browser caching of the GET request
            const response = await api.get(`/public/carts/users/cart?_t=${new Date().getTime()}`);
            
            // ✅ Handle Empty Cart (204 No Content)
            if (response.status === 204 || !response.data) {
                return { cartId: null, totalPrice: 0, products: [] };
            }
            return response.data; 
        } catch (error) {
            // If 404, it just means no cart exists yet
            if (error.response && error.response.status === 404) {
                 return { cartId: null, totalPrice: 0, products: [] };
            }
            return rejectWithValue(error.response?.data || "Failed to load cart");
        }
    }
);

// 2. Add Item
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity, variantId }, { rejectWithValue }) => {
        try {
            const variantParam = variantId ? `?variantId=${variantId}` : "";
            const response = await api.post(
                `/public/carts/products/${productId}/quantity/${quantity}${variantParam}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Could not add item");
        }
    }
);

// 3. Update Quantity
export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    async ({ productId, operation, variantId }, { rejectWithValue }) => {
        try {
            const opString = operation === 'increase' ? 'increase' : 'delete'; 
            const variantParam = variantId ? `?variantId=${variantId}` : "";
            const response = await api.put(
                `/public/cart/products/${productId}/quantity/${opString}${variantParam}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// 4. Remove Item
export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async ({ cartId, productId, variant }, { rejectWithValue }) => {
        try {
            if (!cartId) throw new Error("Cart ID is missing"); // Safety check

            const variantParam = variant ? `?variant=${encodeURIComponent(variant)}` : "";
            const response = await api.delete(`/public/carts/${cartId}/product/${productId}${variantParam}`);
            
            // ✅ CRITICAL FIX: If backend returns 204 (Cart is now empty), return empty object manually
            if (response.status === 204 || !response.data) {
                return { cartId: null, totalPrice: 0, products: [] };
            }

            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// 5. Coupons (unchanged)
export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async ({ cartId, code }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/public/carts/${cartId}/coupon/${code}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Invalid Coupon");
        }
    }
);

export const removeCoupon = createAsyncThunk(
    'cart/removeCoupon',
    async (cartId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/public/carts/${cartId}/coupon`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove coupon");
        }
    }
);
export const fetchAllCarts = createAsyncThunk(
    'cart/fetchAllCarts',
    async (_, { rejectWithValue }) => {
        try {
            // Matches: @GetMapping("/admin/carts")
            const response = await api.get('/admin/carts');
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch carts");
        }
    }
);


// --- B. THE SLICE ---

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cartId: null,
        items: [],       
        totalPrice: 0,
        discount: 0,
        couponCode: null,
        loading: false,
        error: null,
        adminCarts: [], 
    },
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.discount = 0;
            state.couponCode = null;
            state.cartId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- FETCH CART ---
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload || {};
                
                state.cartId = data.cartId || null;
                state.items = data.products || []; 
                state.totalPrice = data.totalPrice || 0;
                state.discount = data.discount || 0;
                state.couponCode = data.couponCode || null;

                // ✅ FIX 2: Consistency Check - If items array is empty, force price to 0
                if (state.items.length === 0) {
                    state.totalPrice = 0;
                }
            })
            .addCase(fetchCart.rejected, (state) => {
                state.loading = false;
                // On error/404, assume empty to prevent ghost items
                state.items = []; 
                state.totalPrice = 0;
                state.cartId = null;
            })

            // --- ADD / UPDATE / REMOVE (Unified Handler) ---
            .addCase(addToCart.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products || [];
                state.totalPrice = action.payload.totalPrice || 0;
                state.discount = action.payload.discount || 0;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products || [];
                state.totalPrice = action.payload.totalPrice || 0;
                state.discount = action.payload.discount || 0;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.items = action.payload.products || []; 
                state.totalPrice = action.payload.totalPrice || 0;
                state.discount = action.payload.discount || 0;
                state.cartId = action.payload.cartId || null;

                // ✅ Consistency Check
                if (state.items.length === 0) {
                    state.totalPrice = 0;
                }
            })

            // --- COUPONS ---
            .addCase(applyCoupon.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products || [];
                state.totalPrice = action.payload.totalPrice;
                state.discount = action.payload.discount;
                state.couponCode = action.payload.couponCode;
            })
            .addCase(removeCoupon.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products || [];
                state.totalPrice = action.payload.totalPrice;
                state.discount = 0;
                state.couponCode = null;
            })
            .addCase(fetchAllCarts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCarts.fulfilled, (state, action) => {
                state.loading = false;
                state.adminCarts = action.payload; // Populate admin list
            })
            .addCase(fetchAllCarts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;