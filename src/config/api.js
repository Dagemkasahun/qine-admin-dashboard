// src/config/api.js
const API_CONFIG = {
  // Change this one line when you need to update the port
  BASE_URL: '',
  
  // API endpoints
  endpoints: {
    merchants: '/api/merchants',
    merchant: (id) => `/api/merchants/${id}`,
  }
};

export default API_CONFIG;