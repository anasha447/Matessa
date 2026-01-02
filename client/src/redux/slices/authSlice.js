import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// --- A. ASYNC ACTIONS ---

// 1. Login User
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signin', credentials);
            // ✅ Save token immediately upon login
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            return response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

// 2. Register User
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

// ✅ 3. FIXED: Check Auth Status (Prevents 401 Error for Guests)
export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        // 1. Check for token in LocalStorage FIRST
        const token = localStorage.getItem("token");

        // 2. If NO token, stop here. Do not call API.
        if (!token) {
            return rejectWithValue("Guest Mode"); 
        }

        // 3. Only call API if we actually have a token
        try {
            const response = await api.get('/auth/user');
            return response.data; 
        } catch (error) {
            // If token is invalid/expired, clear it so we don't keep failing
            localStorage.removeItem("token");
            return rejectWithValue("Session Expired");
        }
    }
);

// 4. Logout User
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/signout');
            localStorage.removeItem("token"); // ✅ Clean up token
            return true;
        } catch (error) {
            return rejectWithValue("Logout failed");
        }
    }
);

// 5. Update User Profile
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

// --- B. THE SLICE ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,           
        isAuthenticated: false,
        loading: false,
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
            // --- LOGIN ---
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

            // --- CHECK AUTH ---
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false; // ✅ Correctly sets guest mode
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