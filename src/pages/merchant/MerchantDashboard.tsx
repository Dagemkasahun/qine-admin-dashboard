// src/pages/merchant/MerchantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Store, Package, ShoppingBag, Users, 
  TrendingUp, Clock, MapPin, CheckCircle,
  ChevronRight
} from 'lucide-react';

// ✅ FIXED IMPORT (adjust extension based on your file)
import apiClient from '../../api/client';
//import { apiClient } from '../../api/client';
import { merchantApi } from '../../api/merchants.ts';


const MerchantDashboard = () => {
  const { merchantId, businessModel } = useOutletContext();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [merchantId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/merchants/${merchantId}/stats`);
      const data = response.data;

      setStats({
        totalRevenue: data.totalRevenue || 0,
        activeOrders: data.activeOrders || 0,
        totalProducts: data.totalProducts || 0,
        avgRating: data.avgRating || 0
      });

      setRecentOrders(data.recentOrders || []);
      setLowStockItems(data.lowStockItems || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: `ETB ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg. Rating', value: `${stats.avgRating.toFixed(1)}/5`, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UI unchanged */}
    </div>
  );
};

export default MerchantDashboard;