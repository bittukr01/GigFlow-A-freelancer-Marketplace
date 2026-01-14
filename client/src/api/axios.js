import axios from 'axios';

// ✅ Always use VITE_API_URL in production
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,   // ✅ VERY IMPORTANT (cookies)
  headers: {
    'Content-Type': 'application/json'
  }
});

// (optional but useful) global error log
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API error:', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;