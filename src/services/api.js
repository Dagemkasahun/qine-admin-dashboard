// src/services/api.js
// Use relative path so requests go through Netlify's proxy redirect
const API_BASE_URL = '/api';

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

// API service object
export const api = {
  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth: {
    register: (userData) => 
      fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(handleResponse),

    login: (credentials) => 
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }).then(handleResponse),
  },

  // ============================================
  // USER ENDPOINTS
  // ============================================
  users: {
    getAll: () => 
      fetch(`${API_BASE_URL}/users`).then(handleResponse),

    getById: (id) => 
      fetch(`${API_BASE_URL}/users/${id}`).then(handleResponse),

    update: (id, userData) => 
      fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(handleResponse),

    delete: (id) => 
      fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      }).then(handleResponse),
  },

  // ============================================
  // MERCHANT ENDPOINTS
  // ============================================
  merchants: {
    getAll: () => 
      fetch(`${API_BASE_URL}/merchants`).then(handleResponse),

    getById: (id) => 
      fetch(`${API_BASE_URL}/merchants/${id}`).then(handleResponse),

    create: (merchantData) => 
      fetch(`${API_BASE_URL}/merchants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merchantData)
      }).then(handleResponse),

    update: (id, merchantData) => 
      fetch(`${API_BASE_URL}/merchants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merchantData)
      }).then(handleResponse),

    approve: (id, adminId) => 
      fetch(`${API_BASE_URL}/merchants/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      }).then(handleResponse),

    reject: (id, reason) => 
      fetch(`${API_BASE_URL}/merchants/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      }).then(handleResponse),
  },

  // ============================================
  // PRODUCT ENDPOINTS
  // ============================================
  products: {
    getByMerchant: (merchantId) => 
      fetch(`${API_BASE_URL}/merchants/${merchantId}/products`).then(handleResponse),

    create: (productData) => 
      fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      }).then(handleResponse),

    update: (id, productData) => 
      fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      }).then(handleResponse),

    delete: (id) => 
      fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      }).then(handleResponse),

    updateStock: (id, stock) => 
      fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      }).then(handleResponse),
  },

  // ============================================
  // ORDER ENDPOINTS
  // ============================================
  orders: {
    create: (orderData) => 
      fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).then(handleResponse),

    getByMerchant: (merchantId) => 
      fetch(`${API_BASE_URL}/merchants/${merchantId}/orders`).then(handleResponse),

    getByCustomer: (customerId) => 
      fetch(`${API_BASE_URL}/customers/${customerId}/orders`).then(handleResponse),

    getById: (id) => 
      fetch(`${API_BASE_URL}/orders/${id}`).then(handleResponse),

    updateStatus: (id, status, notes, changedBy) => 
      fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, changedBy })
      }).then(handleResponse),

    assignRider: (id, riderId, pickupAddress) => 
      fetch(`${API_BASE_URL}/orders/${id}/assign-rider`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, pickupAddress })
      }).then(handleResponse),
  },

  // ============================================
  // RIDER ENDPOINTS
  // ============================================
  riders: {
    getAll: () => 
      fetch(`${API_BASE_URL}/riders`).then(handleResponse),

    create: (riderData) => 
      fetch(`${API_BASE_URL}/riders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riderData)
      }).then(handleResponse),

    updateLocation: (id, lat, lng) => 
      fetch(`${API_BASE_URL}/riders/${id}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      }).then(handleResponse),

    updateStatus: (id, status) => 
      fetch(`${API_BASE_URL}/riders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).then(handleResponse),
  },

  // ============================================
  // REVIEW ENDPOINTS
  // ============================================
  reviews: {
    create: (reviewData) => 
      fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      }).then(handleResponse),

    getByProduct: (productId) => 
      fetch(`${API_BASE_URL}/products/${productId}/reviews`).then(handleResponse),
  },

  // ============================================
  // WALLET ENDPOINTS
  // ============================================
  wallet: {
    getUserWallet: (userId) => 
      fetch(`${API_BASE_URL}/users/${userId}/wallet`).then(handleResponse),

    deposit: (walletId, amount, description, reference) => 
      fetch(`${API_BASE_URL}/wallets/${walletId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description, reference })
      }).then(handleResponse),
  },

  // ============================================
  // NOTIFICATION ENDPOINTS
  // ============================================
  notifications: {
    getUserNotifications: (userId) => 
      fetch(`${API_BASE_URL}/users/${userId}/notifications`).then(handleResponse),

    markAsRead: (notificationId) => 
      fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH'
      }).then(handleResponse),

    markAllAsRead: (userId) => 
      fetch(`${API_BASE_URL}/users/${userId}/notifications/read-all`, {
        method: 'PATCH'
      }).then(handleResponse),
  },

  // ============================================
  // STATS ENDPOINTS
  // ============================================
  stats: {
    getAdminStats: () => 
      fetch(`${API_BASE_URL}/admin/stats`).then(handleResponse),

    getMerchantStats: (merchantId) => 
      fetch(`${API_BASE_URL}/merchants/${merchantId}/stats`).then(handleResponse),
  },

  // ============================================
  // SETTINGS ENDPOINTS
  // ============================================
  settings: {
    getAll: () => 
      fetch(`${API_BASE_URL}/settings`).then(handleResponse),

    update: (key, value) => 
      fetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      }).then(handleResponse),
  },

  // ============================================
  // SYSTEM ENDPOINTS
  // ============================================
  system: {
    health: () => 
      fetch(`${API_BASE_URL}/health`).then(handleResponse),

    seed: () => 
      fetch(`${API_BASE_URL}/seed`, { method: 'POST' }).then(handleResponse),
  },
};

// Create axios instance with interceptors (optional but recommended)
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);