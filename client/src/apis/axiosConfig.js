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