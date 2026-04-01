// src/pages/merchant/MerchantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Store, Package, ShoppingBag, Users, 
  TrendingUp, Clock, MapPin, CheckCircle,
  Settings, Bell, Search, ChevronRight, DollarSign
} from 'lucide-react';
import { merchantApi } from '../../api/merchants';

const MerchantDashboard = () => {
  const { merchantId, businessModel, setBusinessModel } = useOutletContext();
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
      const data = await merchantApi.getStats(merchantId);
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
      {/* Business Model Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
            <Store className="w-10 h-10 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900">{businessModel?.name || 'My Business'}</h2>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" /> {businessModel?.status || 'Active'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {businessModel?.location || 'Add Location'}</span>
              <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {businessModel?.type || 'Business Type'}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Joined {businessModel?.joinedDate || 'Recently'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Management Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Inventory Control', desc: 'Manage stock levels & SKU tracking', link: 'inventory', icon: Package },
              { title: 'Order Fulfillment', desc: 'Process and track customer orders', link: 'orders', icon: ShoppingBag },
              { title: 'Sales Analytics', desc: 'View revenue and growth reports', link: 'analytics', icon: TrendingUp },
              { title: 'Product Catalog', desc: 'Add and manage your products', link: 'products', icon: Package },
            ].map((item, i) => (
              <a 
                key={i} 
                href={`/merchant/${merchantId}/${item.link}`}
                className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition cursor-pointer flex items-start gap-4"
              >
                <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-xl transition">
                  <item.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 self-center" />
              </a>
            ))}
          </div>
        </div>

        {/* Business Summary Side Panel */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Business Health</h3>
            <p className="text-slate-400 text-sm mb-6">Your performance is {stats.totalRevenue > 0 ? 'growing' : 'starting'}.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Target Reach</span>
                <span className="font-bold text-blue-400">
                  {stats.totalRevenue > 0 ? '65%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: stats.totalRevenue > 0 ? '65%' : '0%' }}></div>
              </div>

              <div className="flex justify-between text-sm mt-4">
                <span>Customer Satisfaction</span>
                <span className="font-bold text-green-400">
                  {stats.avgRating > 0 ? `${(stats.avgRating / 5 * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: stats.avgRating > 0 ? `${(stats.avgRating / 5 * 100)}%` : '0%' }}></div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Quick Insights</p>
              
              {lowStockItems.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-xs">{lowStockItems.length} items are below stock threshold.</p>
                </div>
              )}
              
              {recentOrders.length === 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-xs">Start adding products to get orders.</p>
                </div>
              )}
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;