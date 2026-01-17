import axios from 'axios';

const api = axios.create({
    // Use env variable so it works in Prod too
    baseURL: import.meta.env.VITE_API_URL || '/api', 
    headers: {
        'Content-Type': 'application/json',
    },
    // ⚠️ CRITICAL: This allows the browser to send/receive cookies (Guest ID)
    withCredentials: true 
});

// ✅ ADD THIS SECTION TO FIX THE REFRESH ISSUE
api.interceptors.request.use(
    (config) => {
        // 1. Get the token from LocalStorage (where authSlice saved it)
        const token = localStorage.getItem("token");

        // 2. If token exists, attach it to the header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// ---------------------------------------------------------

// Optional: Interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;