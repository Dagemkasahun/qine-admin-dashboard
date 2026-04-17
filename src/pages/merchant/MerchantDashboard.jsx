// src/pages/merchant/MerchantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Store, Package, ShoppingBag, Users, 
  TrendingUp, Clock, MapPin, CheckCircle,
  ChevronRight, AlertCircle, Star, Plus,
  Eye, Truck, DollarSign, Calendar
} from 'lucide-react';
import apiClient from '@/api/client';

const MerchantDashboard = () => {
  const { merchantId, businessModel } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    avgRating: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [merchantId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch merchant stats
      const statsResponse = await apiClient.get(`/merchants/${merchantId}/stats`);
      const data = statsResponse.data;
      
      setStats({
        totalRevenue: data.totalRevenue || 0,
        activeOrders: data.activeOrders || 0,
        totalProducts: data.totalProducts || 0,
        avgRating: data.avgRating || 0,
        totalOrders: data.totalOrders || 0,
        pendingOrders: data.pendingOrders || 0,
        lowStockCount: data.lowStockItems?.length || 0
      });

      setRecentOrders(data.recentOrders || []);
      setLowStockItems(data.lowStockItems || []);
      
      // Fetch top products
      const productsResponse = await apiClient.get(`/merchants/${merchantId}/products`);
      const topProductsData = productsResponse.data
        .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
        .slice(0, 5);
      setTopProducts(topProductsData);
      
      // Fetch sales data for chart
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const salesResponse = await apiClient.get('/reports/sales', {
        params: {
          merchantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setDailySales(salesResponse.data.daily || []);
      
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
      case 'DELIVERED': return 'bg-green-100 text-green-600';
      case 'PENDING': return 'bg-yellow-100 text-yellow-600';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
      case 'PREPARING': return 'bg-purple-100 text-purple-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'text-green-600', 
      bg: 'bg-green-50',
      trend: '+12.5%'
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+8.3%'
    },
    { 
      label: 'Active Orders', 
      value: stats.activeOrders.toString(), 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      trend: stats.activeOrders > 0 ? `${stats.activeOrders} pending` : '0'
    },
    { 
      label: 'Avg. Rating', 
      value: `${stats.avgRating.toFixed(1)}/5`, 
      icon: Star, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50',
      trend: '★★★★☆'
    },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Plus, path: 'products', color: 'bg-blue-600' },
    { label: 'View Orders', icon: Eye, path: 'orders', color: 'bg-green-600' },
    { label: 'Manage Stock', icon: Package, path: 'inventory', color: 'bg-purple-600' },
    { label: 'Analytics', icon: TrendingUp, path: 'analytics', color: 'bg-orange-600' },
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
          <div key={index} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.trend && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition shadow-sm`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
          </button>
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
              <button 
                onClick={() => navigate('orders')}
                className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </span>
                    <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(order.total)}</span>
                    <span className="text-xs text-slate-400">{order.items?.length || 0} items</span>
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
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
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
                      <button className="block mt-2 text-xs text-blue-600 hover:underline">
                        Order More
                      </button>
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

      {/* Top Products & Sales Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Top Selling Products</h3>
                <p className="text-xs text-slate-500 mt-1">Best performing items</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.totalSold || 0} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-slate-400">Stock: {product.stock}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No products yet</p>
                <button 
                  onClick={() => navigate('products')}
                  className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                >
                  Add your first product →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales Chart (Simple visualization) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Weekly Sales Trend</h3>
              <p className="text-xs text-slate-500 mt-1">Last 7 days performance</p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          
          {dailySales.length > 0 ? (
            <div className="space-y-3">
              {dailySales.slice(-7).map((day, index) => {
                const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1);
                const percentage = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-slate-500">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end px-3 text-white text-xs font-medium"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 15 && formatCurrency(day.revenue)}
                      </div>
                    </div>
                    <div className="w-20 text-right text-xs font-medium">
                      {day.orders} orders
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No sales data available</p>
            </div>
          )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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