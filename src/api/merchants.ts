import apiClient from './client';

export interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  category: string;
  subCategory?: string;
  description?: string;
  logo: string | null;
  coverImage: string | null;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  totalRevenue: number;
  address: string;
  city: string;
  subCity?: string;
  businessPhone: string;
  businessEmail: string;
  status: string;
  configuration?: any;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  images?: string | null;
  isActive: boolean;
  totalSold?: number;
  category?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: any;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export const merchantApi = {
  // Get all merchants
  getAll: async (): Promise<Merchant[]> => {
    const response = await apiClient.get('/merchants');
    return response.data;
  },

  // Get single merchant by ID
  getById: async (id: string): Promise<Merchant & { products: Product[] }> => {
    const response = await apiClient.get(`/merchants/${id}`);
    return response.data;
  },

  // Get merchant dashboard stats
  getStats: async (merchantId: string): Promise<any> => {
    const response = await apiClient.get(`/merchants/${merchantId}/stats`);
    return response.data;
  },

  // Update merchant profile
  updateProfile: async (merchantId: string, data: Partial<Merchant>): Promise<Merchant> => {
    const response = await apiClient.put(`/merchants/${merchantId}`, data);
    return response.data;
  },

  // Get products
  getProducts: async (merchantId: string): Promise<Product[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/products`);
    return response.data;
  },

  // Create product
 createProduct: async (merchantId: string, productData: any): Promise<Product> => {
  const response = await apiClient.post('/products', {
    merchantId: merchantId,
    name: productData.name,
    description: productData.description,
    shortDesc: productData.shortDesc,
    price: productData.price,
    stock: productData.stock,
    sku: productData.sku,
    images: productData.images,
    categoryId: productData.categoryId,
    isActive: productData.isActive,
    weight: productData.weight
  });
  return response.data;
},

  // Update product
  updateProduct: async (productId: string, productData: any): Promise<Product> => {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}`);
  },

  // Update product stock
  updateStock: async (productId: string, stock: number): Promise<Product> => {
    const response = await apiClient.patch(`/products/${productId}/stock`, { stock });
    return response.data;
  },

  // Get orders for merchant
  getOrders: async (merchantId: string): Promise<Order[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/orders`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get categories
  getCategories: async (merchantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/merchants/${merchantId}/categories`);
    return response.data;
  },

  // Create category
  createCategory: async (merchantId: string, name: string): Promise<any> => {
    const response = await apiClient.post(`/merchants/${merchantId}/categories`, { name });
    return response.data;
  },
};