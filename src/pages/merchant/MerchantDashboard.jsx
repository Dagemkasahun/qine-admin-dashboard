// src/pages/merchant/MerchantDashboard.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, Package, ShoppingBag, TrendingUp, 
  Clock, MapPin, CheckCircle, AlertCircle, Star
} from 'lucide-react';
import apiClient from '../../api/client';

const MerchantDashboard = () => {
  const { merchantId, businessModel } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    avgRating: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [merchantData, setMerchantData] = useState(null);

  useEffect(() => {
    // Try to get merchantId from outlet context or from user object
    const id = merchantId || user?.merchant?.id;
    if (id) {
      fetchDashboardData(id);
    } else {
      console.error('No merchant ID found');
      setLoading(false);
    }
  }, [merchantId, user]);

  const fetchDashboardData = async (id) => {
    try {
      setLoading(true);
      
      // Try the dashboard endpoint first
      let response;
      try {
        response = await apiClient.get('/merchants/dashboard');
        console.log('Dashboard response:', response.data);
        
        if (response.data) {
          setStats({
            totalRevenue: response.data.stats?.totalRevenue || 0,
            activeOrders: response.data.stats?.activeOrders || 0,
            totalProducts: response.data.stats?.totalProducts || 0,
            avgRating: response.data.stats?.avgRating || 0,
            totalOrders: response.data.stats?.totalOrders || 0
          });
          setRecentOrders(response.data.recentOrders || []);
          setLowStockItems(response.data.lowStockItems || []);
          setMerchantData(response.data.merchant);
          setLoading(false);
          return;
        }
      } catch (dashboardError) {
        console.log('Dashboard endpoint failed, trying stats endpoint:', dashboardError.message);
        
        // Fallback to stats endpoint
        const statsResponse = await apiClient.get(`/merchants/${id}/stats`);
        const data = statsResponse.data;
        
        setStats({
          totalRevenue: data.totalRevenue || 0,
          activeOrders: data.activeOrders || 0,
          totalProducts: data.totalProducts || 0,
          avgRating: data.avgRating || 0,
          totalOrders: data.totalOrders || 0
        });
        setRecentOrders(data.recentOrders || []);
        setLowStockItems(data.lowStockItems || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `ETB ${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-purple-100 text-purple-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Clock },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  const displayName = merchantData?.businessName || businessModel?.name || user?.merchant?.businessName || 'Your Store';
  const displayCategory = merchantData?.category || businessModel?.category || 'Store';
  const displayAddress = merchantData?.address || businessModel?.location || 'Address not set';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back!</h2>
            <p className="text-slate-500 text-sm">{displayName}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl">
            <Store className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Rating Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-slate-600">Customer Rating</span>
          </div>
          <span className="text-xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}/5</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Orders</h3>
              <button 
                onClick={() => navigate('orders')}
                className="text-blue-600 text-xs hover:underline"
              >
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800">#{order.orderNumber || order.id?.slice(-8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {order.customer?.firstName} {order.customer?.lastName || 'Customer'}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="font-semibold text-slate-800">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Low Stock Alerts</h3>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-1">SKU: {item.sku || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        {item.stock} left
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">All products well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Store className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Business Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Business Name</p>
            <p className="font-medium text-slate-800">{displayName}</p>
          </div>
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-medium text-slate-800">{displayCategory}</p>
          </div>
          <div>
            <p className="text-slate-500">Location</p>
            <p className="font-medium text-slate-800 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {displayAddress}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;