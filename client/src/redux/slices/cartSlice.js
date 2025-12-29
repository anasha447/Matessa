import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig'; 

// --- A. ASYNC ACTIONS (THUNKS) ---

// 1. Fetch Cart (Load on startup)
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/public/carts/users/cart');
            
            // If backend returns 204 No Content (empty cart)
            if (response.status === 204) {
                return { cartId: null, totalPrice: 0, products: [] };
            }
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to load cart");
        }
    }
);

export const removeCoupon = createAsyncThunk(
    'cart/removeCoupon',
    async (cartId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/public/carts/${cartId}/coupon`);
            return response.data; // Returns updated CartDTO with NO discount
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove coupon");
        }
    }
);

export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async ({ cartId, code }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/public/carts/${cartId}/coupon/${code}`);
            return response.data; // Returns updated CartDTO
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Invalid Coupon");
        }
    }
);

// 2. Add Item
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    // ✅ Updated: Now expects 'variantId' (Long) instead of just name
    async ({ productId, quantity, variantId }, { rejectWithValue }) => {
        try {
            // Backend expects: POST /.../quantity/{qty}?variantId={id}
            const variantParam = variantId ? `?variantId=${variantId}` : "";
            
            const response = await api.post(
                `/public/carts/products/${productId}/quantity/${quantity}${variantParam}`
            );
            return response.data; // Returns updated CartDTO
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Could not add item");
        }
    }
);

// 3. Update Quantity (Increase/Decrease)
export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    // ✅ Updated: Now accepts 'variantId'
    async ({ productId, operation, variantId }, { rejectWithValue }) => {
        try {
            const opString = operation === 'increase' ? 'increase' : 'delete'; 
            
            // Backend expects: PUT /.../quantity/{op}?variantId={id}
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
            const variantParam = variant ? `?variant=${encodeURIComponent(variant)}` : "";

            // 1. Call Backend
            const response = await api.delete(`/public/carts/${cartId}/product/${productId}${variantParam}`);
            
            // ✅ FIX: Return the Backend Response (CartDTO)
            // This object contains the NEW totalPrice calculated by the server.
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// --- B. THE SLICE ---

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cartId: null,
        items: [],       // List of ProductDTO (with quantity)
        totalPrice: 0,
        loading: false,
        error: null,
    },
    reducers: {
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
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
                if (action.payload) {
                    state.cartId = action.payload.cartId;
                    state.items = action.payload.products || []; // Ensure array
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.items = [];
            })

            // --- ADD ITEM ---
            .addCase(addToCart.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.loading = false;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- UPDATE ITEM ---
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.cartId = action.payload.cartId;
                state.items = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
            })

            .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId;
        state.items = action.payload.products;
        state.totalPrice = action.payload.totalPrice;
        // You might need to add a 'discount' field to your state if you want to show it
        state.discount = action.payload.discount; 
         })
         .addCase(removeCartItem.fulfilled, (state, action) => {
    // ❌ OLD WAY: (Manual filtering - Keeps old price)
    // state.items = state.items.filter(item => item.productId !== action.payload.productId);

    // ✅ NEW WAY: (Full Sync - Updates Price & Items)
    // The backend did the math, we just display the result.
    state.items = action.payload.products; 
    state.totalPrice = action.payload.totalPrice; // <--- The Fix
    state.discount = action.payload.discount || 0;
    state.couponCode = action.payload.couponCode;
})

            .addCase(removeCoupon.fulfilled, (state, action) => {
        state.cartId = action.payload.cartId;
        state.items = action.payload.products;
        state.totalPrice = action.payload.totalPrice;
        state.discount = 0; // Reset discount
         });
    },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;