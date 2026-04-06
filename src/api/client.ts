// src/api/client.ts
import axios from 'axios';

const getApiUrl = () => {
  // Check if we're running on Vercel (production)
  if (import.meta.env.PROD) {
    // Use the production backend
    return 'https://qine-backend.onrender.com/api';
  }
  
  // Development mode - use local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }
  
  // Fallback - use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  return 'https://qine-backend.onrender.com/api';
};

const API_URL = getApiUrl();
console.log(`🌐 Environment: ${import.meta.env.MODE}`);
console.log(`📡 API URL: ${API_URL}`);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development only
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;