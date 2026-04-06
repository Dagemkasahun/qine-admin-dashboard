// src/pages/merchant/MerchantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Store, Package, ShoppingBag, Users, 
  TrendingUp, Clock, MapPin, CheckCircle,
  ChevronRight, AlertCircle, Star
} from 'lucide-react';
import apiClient from '@/api/client';
import { merchantApi } from '../../api/merchants';

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
    { label: 'Avg. Rating', value: `${stats.avgRating.toFixed(1)}/5`, icon: Star, color: 'text-orange-600', bg: 'bg-orange-50' },
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {businessModel.name}!</h2>
            <p className="text-blue-100">Here's what's happening with your business today.</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <Store className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Recent Orders</h3>
                <p className="text-xs text-slate-500 mt-1">Latest customer orders</p>
              </div>
              <ShoppingBag className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">ETB {order.total?.toLocaleString()}</span>
                    <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Low Stock Alerts</h3>
                <p className="text-xs text-slate-500 mt-1">Items needing restock</p>
              </div>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, index) => (
                <div key={index} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-1">SKU: {item.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black">
                        {item.stock} units left
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">All products well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Business Name</p>
                <p className="font-medium text-slate-800">{businessModel.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Category</p>
                <p className="font-medium text-slate-800">{businessModel.category || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {businessModel.location || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="w-3 h-3" /> {businessModel.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;