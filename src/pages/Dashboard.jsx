// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Bike, Package, ShoppingBag,
  DollarSign, Clock, CheckCircle, AlertTriangle,
  Activity, Calendar, ArrowUp, MoreHorizontal, Bell,
  TrendingUp, TrendingDown, Star, MapPin, Phone
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNotifications } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// ==================== Admin Dashboard ====================
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const { unreadCount } = useNotifications();
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        revenue: { today: 45678, week: 324567, month: 1456789, growth: 23.5 },
        orders: { total: 3421, pending: 23, processing: 45, delivered: 3128, cancelled: 225 },
        users: { total: 15420, active: 8234, new: 156, merchants: 41, riders: 89 },
        performance: { avgDeliveryTime: 32, onTimeRate: 94.2, satisfaction: 4.6, conversionRate: 3.2 }
      });

      setRecentOrders([
        { id: 'ORD-001', customer: 'Abebe Kebede', amount: 1250, status: 'delivered', time: '5 min ago', items: 3 },
        { id: 'ORD-002', customer: 'Sara Hailu', amount: 890, status: 'processing', time: '15 min ago', items: 2 },
        { id: 'ORD-003', customer: 'Yonas Desta', amount: 2340, status: 'pending', time: '25 min ago', items: 5 },
        { id: 'ORD-004', customer: 'Meron Tesfaye', amount: 560, status: 'delivered', time: '35 min ago', items: 1 },
        { id: 'ORD-005', customer: 'Dawit Lemma', amount: 1870, status: 'cancelled', time: '45 min ago', items: 4 }
      ]);

      setTopMerchants([
        { id: 1, name: 'Pure Honey Ethiopia', revenue: 456780, orders: 456, rating: 4.8, growth: 23 },
        { id: 2, name: 'Taste of Ethiopia', revenue: 398450, orders: 389, rating: 4.9, growth: 18 },
        { id: 3, name: 'Elite Stationary', revenue: 267890, orders: 245, rating: 4.7, growth: 15 },
        { id: 4, name: 'ABC School', revenue: 156780, orders: 134, rating: 4.5, growth: 12 },
        { id: 5, name: 'BizConsult', revenue: 98760, orders: 89, rating: 4.9, growth: 8 }
      ]);

      setRecentActivities([
        { id: 1, type: 'order', action: 'New order received', user: 'Abebe K.', time: '2 min ago', status: 'success' },
        { id: 2, type: 'merchant', action: 'Merchant joined', user: 'New Shop Co.', time: '15 min ago', status: 'info' },
        { id: 3, type: 'delivery', action: 'Delivery completed', user: 'Getachew T.', time: '20 min ago', status: 'success' },
        { id: 4, type: 'payment', action: 'Payment received', user: 'Order #1234', time: '25 min ago', status: 'success' },
        { id: 5, type: 'alert', action: 'Low stock alert', user: 'White Honey', time: '30 min ago', status: 'warning' },
        { id: 6, type: 'user', action: 'New user registered', user: 'Tigist W.', time: '45 min ago', status: 'info' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (darkMode) {
      const darkColors = {
        pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        processing: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        delivered: 'bg-green-500/20 text-green-300 border border-green-500/30',
        cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30'
      };
      return darkColors[status] || 'bg-slate-700 text-slate-300 border border-slate-600';
    }
    const lightColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return lightColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'merchant': return <Store className="w-4 h-4 text-green-500" />;
      case 'delivery': return <Bike className="w-4 h-4 text-purple-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'user': return <Users className="w-4 h-4 text-indigo-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const cardClass = darkMode
    ? 'bg-slate-800 border border-slate-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-slate-400' : 'text-gray-600';
  const tableHead = darkMode ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-500';
  const hoverRow = darkMode ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50';
  const divider = darkMode ? 'border-slate-700' : 'border-gray-200';
  const pageBg = darkMode ? 'bg-slate-900' : 'bg-gray-50';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg border px-3 py-2 shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`p-6 min-h-screen ${pageBg}`}>
        <div className="animate-pulse">
          <div className={`h-8 w-64 mb-6 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`${cardClass} rounded-lg shadow p-6`}>
                <div className={`h-4 w-24 mb-4 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                <div className={`h-8 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
          <p className={`${mutedText} mt-1`}>
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        <div className="flex items-center space-x-4 flex-wrap">
          <div className={`${cardClass} rounded-lg shadow px-4 py-2 flex items-center`}>
            <Calendar className={`w-4 h-4 mr-2 ${mutedText}`} />
            <span className={`text-sm ${mutedText}`}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>

          {unreadCount > 0 && (
            <div className={`px-4 py-2 rounded-lg flex items-center border ${
              darkMode ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              <Bell className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{unreadCount} new notifications</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-green-500/20' : 'bg-green-100'} p-2 rounded-lg`}>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              <ArrowUp className="w-4 h-4 mr-1" />{stats.revenue?.growth}%
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Total Revenue</p>
          <p className="text-2xl font-bold">ETB {stats.revenue?.month?.toLocaleString()}</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Today: ETB {stats.revenue?.today?.toLocaleString()}</span>
            <span>Week: ETB {stats.revenue?.week?.toLocaleString()}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} p-2 rounded-lg`}>
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <Link to="/admin/orders" className="text-blue-500 hover:text-blue-400 text-sm">
              View all →
            </Link>
          </div>
          <p className={`${mutedText} text-sm`}>Total Orders</p>
          <p className="text-2xl font-bold">{stats.orders?.total}</p>
          <div className="mt-2 flex text-xs">
            <span className="mr-3 text-yellow-500">Pending: {stats.orders?.pending}</span>
            <span className="text-blue-500">Processing: {stats.orders?.processing}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} p-2 rounded-lg`}>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              <ArrowUp className="w-4 h-4 mr-1" />+{stats.users?.new} today
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Total Users</p>
          <p className="text-2xl font-bold">{stats.users?.total?.toLocaleString()}</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Active: {stats.users?.active?.toLocaleString()}</span>
            <span>Merchants: {stats.users?.merchants}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'} p-2 rounded-lg`}>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />{stats.performance?.onTimeRate}% on time
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Avg. Delivery Time</p>
          <p className="text-2xl font-bold">{stats.performance?.avgDeliveryTime} min</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Rating: {stats.performance?.satisfaction} ★</span>
            <span>Conversion: {stats.performance?.conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Role-specific Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg p-4 text-center`}>
          <p className={`${mutedText} text-xs`}>Pending Approvals</p>
          <p className="text-xl font-bold text-yellow-500">3</p>
          <Link to="/admin/approvals" className="text-blue-500 text-xs hover:underline">Review →</Link>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center`}>
          <p className={`${mutedText} text-xs`}>Active Riders</p>
          <p className="text-xl font-bold text-green-500">{stats.users?.riders || 89}</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center`}>
          <p className={`${mutedText} text-xs`}>Total Merchants</p>
          <p className="text-xl font-bold text-blue-500">{stats.users?.merchants || 41}</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center`}>
          <p className={`${mutedText} text-xs`}>Today's Orders</p>
          <p className="text-xl font-bold text-purple-500">156</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center`}>
          <p className={`${mutedText} text-xs`}>System Health</p>
          <p className="text-xl font-bold text-emerald-500">98.5%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <select className={`text-sm rounded-lg px-3 py-1 border ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { day: 'Mon', revenue: 45000 }, { day: 'Tue', revenue: 52000 },
              { day: 'Wed', revenue: 48000 }, { day: 'Thu', revenue: 61000 },
              { day: 'Fri', revenue: 58000 }, { day: 'Sat', revenue: 63000 },
              { day: 'Sun', revenue: 67000 }
            ]}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
              <XAxis dataKey="day" stroke={darkMode ? "#cbd5e1" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Orders Overview</h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>Pending</span>
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>Processing</span>
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Delivered</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { day: 'Mon', pending: 5, processing: 12, delivered: 45 },
              { day: 'Tue', pending: 3, processing: 15, delivered: 52 },
              { day: 'Wed', pending: 7, processing: 18, delivered: 48 },
              { day: 'Thu', pending: 4, processing: 14, delivered: 61 },
              { day: 'Fri', pending: 8, processing: 16, delivered: 58 },
              { day: 'Sat', pending: 6, processing: 20, delivered: 63 },
              { day: 'Sun', pending: 2, processing: 10, delivered: 55 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
              <XAxis dataKey="day" stroke={darkMode ? "#cbd5e1" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
              <Bar dataKey="pending" fill="#FBBF24" />
              <Bar dataKey="processing" fill="#60A5FA" />
              <Bar dataKey="delivered" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders + Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${divider} flex justify-between items-center`}>
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-500 hover:text-blue-400 text-sm">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={tableHead}>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                {recentOrders.map((order) => (
                  <tr key={order.id} className={hoverRow}>
                    <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                    <td className="py-3 px-4 text-sm">{order.customer}</td>
                    <td className="py-3 px-4 text-sm">ETB {order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-xs ${mutedText}`}>{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${divider} flex justify-between items-center`}>
            <h2 className="text-lg font-semibold">Top Merchants</h2>
            <Link to="/merchants" className="text-blue-500 hover:text-blue-400 text-sm">View all →</Link>
          </div>
          <div className="p-4 space-y-4">
            {topMerchants.map((merchant) => (
              <div key={merchant.id} className={`flex items-center justify-between p-3 rounded-lg ${hoverRow}`}>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                    {merchant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <div className={`flex items-center text-xs ${mutedText}`}>
                      <span className="mr-2">{merchant.orders} orders</span>
                      <span>★ {merchant.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500">ETB {merchant.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 flex items-center justify-end">
                    <ArrowUp className="w-3 h-3 mr-1" />{merchant.growth}% growth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`${cardClass} rounded-lg shadow`}>
        <div className={`px-6 py-4 border-b ${divider}`}>
          <h2 className="text-lg font-semibold">Recent Activities</h2>
        </div>
        <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={`px-6 py-3 flex items-center ${hoverRow}`}>
              <div className="flex-shrink-0 mr-3">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.action}</span>
                  <span className={` ${mutedText}`}> by {activity.user}</span>
                </p>
              </div>
              <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition">
            <MoreHorizontal className="w-6 h-6" />
          </button>
          <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-lg shadow-lg border hidden group-hover:block ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="py-2">
              <Link to="/merchants/add" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                Add New Merchant
              </Link>
              <Link to="/products/add" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                Add New Product
              </Link>
              <Link to="/reports" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                Generate Report
              </Link>
              <Link to="/settings" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Merchant Dashboard ====================
const MerchantDashboardView = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 142850,
    totalOrders: 384,
    activeOrders: 12,
    avgRating: 4.6,
    totalProducts: 45,
    lowStockCount: 3
  });

  const cardClass = darkMode
    ? 'bg-slate-800 border border-slate-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-slate-400' : 'text-gray-600';
  const pageBg = darkMode ? 'bg-slate-900' : 'bg-gray-50';

  const statCards = [
    { label: 'Total Revenue', value: `ETB ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: darkMode ? 'bg-green-500/20' : 'bg-green-100', trend: '+12.5%' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-500', bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100', trend: '+8.3%' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Clock, color: 'text-orange-500', bg: darkMode ? 'bg-orange-500/20' : 'bg-orange-100', trend: `${stats.activeOrders} pending` },
    { label: 'Avg. Rating', value: `${stats.avgRating}/5`, icon: Star, color: 'text-yellow-500', bg: darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100', trend: '★★★★☆' },
  ];

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome back, {user?.firstName || 'Merchant'}!
        </h1>
        <p className={`${mutedText} mt-1`}>Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="flex items-center text-sm text-green-500">
                <TrendingUp className="w-4 h-4 mr-1" />{stat.trend}
              </span>
            </div>
            <p className={`${mutedText} text-sm`}>{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Add Product', path: 'products', color: 'bg-blue-600', icon: Package },
          { label: 'View Orders', path: 'orders', color: 'bg-green-600', icon: ShoppingBag },
          { label: 'Manage Stock', path: 'inventory', color: 'bg-purple-600', icon: Package },
          { label: 'Analytics', path: 'analytics', color: 'bg-orange-600', icon: TrendingUp },
        ].map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition shadow-sm`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {stats.lowStockCount > 0 && (
        <div className={`${cardClass} rounded-lg shadow p-6 mb-8 border-l-4 border-yellow-500`}>
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-semibold">Low Stock Alert</h3>
              <p className={`${mutedText} text-sm`}>
                You have {stats.lowStockCount} products running low on stock.
                <Link to="inventory" className="text-blue-500 ml-2 hover:underline">Review Inventory →</Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Placeholder */}
      <div className={`${cardClass} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="orders" className="text-blue-500 hover:text-blue-400 text-sm">View all →</Link>
        </div>
        <p className={`${mutedText} text-center py-8`}>Loading recent orders...</p>
      </div>
    </div>
  );
};

// ==================== Rider Dashboard ====================
const RiderDashboardView = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [stats] = useState({
    todayDeliveries: 8,
    totalEarnings: 1250,
    rating: 4.8,
    onlineStatus: true
  });

  const cardClass = darkMode
    ? 'bg-slate-800 border border-slate-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-slate-400' : 'text-gray-600';
  const pageBg = darkMode ? 'bg-slate-900' : 'bg-gray-50';

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome back, {user?.firstName || 'Rider'}!
        </h1>
        <p className={`${mutedText} mt-1`}>Ready for your next delivery?</p>
      </div>

      {/* Status Toggle */}
      <div className={`${cardClass} rounded-lg shadow p-6 mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Your Status</h3>
            <p className={`${mutedText}`}>
              {stats.onlineStatus ? 'You are online and can receive orders' : 'You are offline'}
            </p>
          </div>
          <button className={`px-6 py-3 rounded-lg font-medium ${
            stats.onlineStatus 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {stats.onlineStatus ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex items-center mb-2">
            <Package className="w-6 h-6 text-blue-500 mr-2" />
            <p className={`${mutedText} text-sm`}>Today's Deliveries</p>
          </div>
          <p className="text-3xl font-bold">{stats.todayDeliveries}</p>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex items-center mb-2">
            <DollarSign className="w-6 h-6 text-green-500 mr-2" />
            <p className={`${mutedText} text-sm`}>Today's Earnings</p>
          </div>
          <p className="text-3xl font-bold">ETB {stats.totalEarnings}</p>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex items-center mb-2">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            <p className={`${mutedText} text-sm`}>Your Rating</p>
          </div>
          <p className="text-3xl font-bold">{stats.rating} ★</p>
        </div>
      </div>

      {/* Available Orders */}
      <div className={`${cardClass} rounded-lg shadow p-6`}>
        <h2 className="text-lg font-semibold mb-4">Available Orders</h2>
        <p className={`${mutedText} text-center py-8`}>No available orders at the moment</p>
      </div>
    </div>
  );
};

// ==================== Main Dashboard Component ====================
const Dashboard = () => {
  const { user } = useAuth();

  // Render different dashboard based on user role
  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MERCHANT':
      return <MerchantDashboardView />;
    case 'RIDER':
      return <RiderDashboardView />;
    case 'CUSTOMER':
      return <div>Customer Dashboard Coming Soon</div>;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;