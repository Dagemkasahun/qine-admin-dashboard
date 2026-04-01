// src/api/inventory.ts
import { apiClient } from './client.js';

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reserved: number;
  available: number;
  location?: string;
  expiryDate?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

export const inventoryApi = {
  // Get inventory items for merchant
  getInventory: async (merchantId: string): Promise<InventoryItem[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/inventory`);
    return response.data;
  },

  // Get inventory movements
  getMovements: async (merchantId: string): Promise<InventoryMovement[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/inventory/movements`);
    return response.data;
  },

  // Adjust inventory
  adjustInventory: async (productId: string, quantity: number, reason: string): Promise<any> => {
    const response = await apiClient.post(`/inventory/adjust`, { productId, quantity, reason });
    return response.data;
  },
};