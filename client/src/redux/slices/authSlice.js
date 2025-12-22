import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../apis/axiosConfig';

// --- A. ASYNC ACTIONS ---

// 1. Login User
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signin', credentials);
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

// 3. Check Auth Status
export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/user');
            return response.data; 
        } catch (error) {
            return rejectWithValue("Not authenticated");
        }
    }
);

// 4. Logout User
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/signout');
            return true;
        } catch (error) {
            return rejectWithValue("Logout failed");
        }
    }
);

// ✅ 5. NEW: Update User Profile (Required for Profile Page)
export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { rejectWithValue }) => {
        try {
            // This matches the Backend Endpoint we updated earlier
            // ensure your backend accepts PUT on /auth/user or create a specific endpoint
            // If using the controller I provided previously, it might need a specific endpoint like /users/profile
            // For now, let's assume you added a PUT endpoint in AuthController or UserController
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
                state.isAuthenticated = false;
                state.user = null;
            })

            // --- LOGOUT ---
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })

            // ✅ NEW: UPDATE PROFILE HANDLERS
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                // Update the user object with the new data from backend
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