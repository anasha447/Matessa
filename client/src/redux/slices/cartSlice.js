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

// 2. Add Item (Updated for Variants & Flavors)
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    // Now accepts 'variant' and 'flavor' in the arguments
    async ({ productId, quantity, variant, flavor }, { rejectWithValue }) => {
        try {
            // ✅ We pass variant/flavor in the BODY (second argument of api.post)
            // URL: /api/public/carts/products/{id}/quantity/{qty}
            const response = await api.post(
                `/public/carts/products/${productId}/quantity/${quantity}`, 
                { 
                    variant: variant || null, // e.g., "100g"
                    flavor: flavor || null    // e.g., "Lemon"
                }
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
    async ({ productId, operation }, { rejectWithValue }) => {
        try {
            const opString = operation === 'increase' ? 'increase' : 'delete'; 
            
            const response = await api.put(`/public/cart/products/${productId}/quantity/${opString}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// 4. Remove Item
export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async ({ cartId, productId }, { rejectWithValue }) => {
        try {
            await api.delete(`/public/carts/${cartId}/product/${productId}`);
            return productId; 
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
                // 404/Error usually means empty cart or guest
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

            // --- REMOVE ITEM ---
            .addCase(removeCartItem.fulfilled, (state, action) => {
                // Optimistically remove from UI
                state.items = state.items.filter(item => item.productId !== action.payload);
                // Note: Total price might be inaccurate until next fetch/action if not returned by backend
            });
    },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;