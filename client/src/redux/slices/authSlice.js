import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// --- A. ASYNC ACTIONS (Keep these exactly the same) ---

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signin', credentials);
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Registration failed");
        }
    }
);

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        if (!token) return rejectWithValue("Guest Mode"); 

        try {
            const response = await api.get('/auth/user');
            return response.data; 
        } catch (error) {
            localStorage.removeItem("token");
            return rejectWithValue("Session Expired");
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/signout');
            localStorage.removeItem("token");
            return true;
        } catch (error) {
            return rejectWithValue("Logout failed");
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.put('/users/profile', userData); 
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Profile update failed");
        }
    }
);

// --- B. THE SLICE (Updated Logic) ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,           
        isAuthenticated: false,
        loading: false,        // For buttons (Login/Register spinners)
        isCheckingAuth: true,  // ✅ NEW: Starts TRUE to hold the screen on load
        error: null,
        registrationSuccess: false 
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.registrationSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- LOGIN (Uses 'loading' for button spinner) ---
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload; 
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload; 
            })

            // --- REGISTER ---
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.registrationSuccess = false;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.registrationSuccess = true; 
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; 
            })

            // --- CHECK AUTH (Uses 'isCheckingAuth' to block/unblock App) ---
            .addCase(checkAuthStatus.pending, (state) => {
                state.isCheckingAuth = true; // ✅ Start blocking
                // Note: We do NOT set state.loading = true here to avoid UI flash
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.isCheckingAuth = false; // ✅ Stop blocking
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.isCheckingAuth = false; // ✅ Stop blocking (Let them see Public pages)
                state.isAuthenticated = false; 
                state.user = null;
            })

            // --- LOGOUT ---
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })

            // --- UPDATE PROFILE ---
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; 
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;