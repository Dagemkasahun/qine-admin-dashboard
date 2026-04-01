// src/api/client.ts
import axios from 'axios';

// Get API URL from environment variable or use default
const getApiUrl = () => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for production
  if (import.meta.env.PROD) {
    return 'https://qine-backend.onrender.com/api';
  }
  // Development fallback
  return 'http://localhost:5001/api';
};

const API_URL = getApiUrl();
console.log('🔵 API URL:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);