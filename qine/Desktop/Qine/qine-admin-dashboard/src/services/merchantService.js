// src/services/merchantService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Your backend API URL

export const merchantService = {
  // Get all merchants
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/merchants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      throw error;
    }
  },

  // Get merchant by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/merchants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchant:', error);
      throw error;
    }
  },

  // Create new merchant
  create: async (merchantData) => {
    try {
      const response = await axios.post(`${API_URL}/merchants`, merchantData);
      return response.data;
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  },

  // Update merchant
  update: async (id, merchantData) => {
    try {
      const response = await axios.put(`${API_URL}/merchants/${id}`, merchantData);
      return response.data;
    } catch (error) {
      console.error('Error updating merchant:', error);
      throw error;
    }
  },

  // Delete merchant
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/merchants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting merchant:', error);
      throw error;
    }
  },

  // Get merchant products
  getProducts: async (merchantId) => {
    try {
      const response = await axios.get(`${API_URL}/merchants/${merchantId}/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchant products:', error);
      throw error;
    }
  }
};