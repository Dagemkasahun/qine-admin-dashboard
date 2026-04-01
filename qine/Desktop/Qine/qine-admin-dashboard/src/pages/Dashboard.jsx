// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, Store, Bike, Package,
  DollarSign, Clock, CheckCircle, AlertTriangle,
  ShoppingBag, CreditCard, Activity, Calendar,
  ArrowUp, ArrowDown, Eye, MoreHorizontal
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const { unreadCount } = useNotifications();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setStats({
        // Revenue Stats
        revenue: {
          today: 45678,
          week: 324567,
          month: 1456789,
          growth: 23.5
        },
        // Order Stats
        orders: {
          total: 3421,
          pending: 23,
          processing: 45,
          delivered: 3128,
          cancelled: 225
        },
        // User Stats
        users: {
          total: 15420,
          active: 8234,
          new: 156,
          merchants: 41,
          riders: 89
        },
        // Performance Stats
        performance: {
          avgDeliveryTime: 32,
          onTimeRate: 94.2,
          satisfaction: 4.6,
          conversionRate: 3.2
        }
      });

      setRecentOrders([
        { 
          id: 'ORD-001', 
          customer: 'Abebe Kebede', 
          amount: 1250, 
          status: 'delivered', 
          time: '5 min ago',
          items: 3,
          payment: 'paid'
        },
        { 
          id: 'ORD-002', 
          customer: 'Sara Hailu', 
          amount: 890, 
          status: 'processing', 
          time: '15 min ago',
          items: 2,
          payment: 'paid'
        },
        { 
          id: 'ORD-003', 
          customer: 'Yonas Desta', 
          amount: 2340, 
          status: 'pending', 
          time: '25 min ago',
          items: 5,
          payment: 'pending'
        },
        { 
          id: 'ORD-004', 
          customer: 'Meron Tesfaye', 
          amount: 560, 
          status: 'delivered', 
          time: '35 min ago',
          items: 1,
          payment: 'paid'
        },
        { 
          id: 'ORD-005', 
          customer: 'Dawit Lemma', 
          amount: 1870, 
          status: 'cancelled', 
          time: '45 min ago',
          items: 4,
          payment: 'refunded'
        }
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
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Welcome and Date */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg shadow px-4 py-2 flex items-center">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{unreadCount} new notifications</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              {stats.revenue?.growth}%
            </span>
          </div>
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">ETB {stats.revenue?.month?.toLocaleString()}</p>
          <div className="mt-2 flex text-xs text-gray-500">
            <span className="mr-3">Today: ETB {stats.revenue?.today?.toLocaleString()}</span>
            <span>Week: ETB {stats.revenue?.week?.toLocaleString()}</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{stats.orders?.total}</p>
          <div className="mt-2 flex text-xs">
            <span className="mr-3 text-yellow-600">Pending: {stats.orders?.pending}</span>
            <span className="text-blue-600">Processing: {stats.orders?.processing}</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              +{stats.users?.new} today
            </span>
          </div>
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{stats.users?.total?.toLocaleString()}</p>
          <div className="mt-2 flex text-xs text-gray-500">
            <span className="mr-3">Active: {stats.users?.active?.toLocaleString()}</span>
            <span>Merchants: {stats.users?.merchants}</span>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              {stats.performance?.onTimeRate}% on time
            </span>
          </div>
          <p className="text-gray-600 text-sm">Avg. Delivery Time</p>
          <p className="text-2xl font-bold">{stats.performance?.avgDeliveryTime} min</p>
          <div className="mt-2 flex text-xs text-gray-500">
            <span className="mr-3">Rating: {stats.performance?.satisfaction} ★</span>
            <span>Conversion: {stats.performance?.conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <select className="text-sm border rounded-lg px-3 py-1">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { day: 'Mon', revenue: 45000 },
              { day: 'Tue', revenue: 52000 },
              { day: 'Wed', revenue: 48000 },
              { day: 'Thu', revenue: 61000 },
              { day: 'Fri', revenue: 58000 },
              { day: 'Sat', revenue: 63000 },
              { day: 'Sun', revenue: 67000 }
            ]}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `ETB ${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Orders Overview</h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span> Pending
              </span>
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span> Processing
              </span>
              <span className="flex items-center text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Delivered
              </span>
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pending" fill="#FBBF24" />
              <Bar dataKey="processing" fill="#60A5FA" />
              <Bar dataKey="delivered" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders and Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                    <td className="py-3 px-4 text-sm">{order.customer}</td>
                    <td className="py-3 px-4 text-sm">ETB {order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Top Merchants</h2>
            <Link to="/merchants" className="text-blue-600 hover:text-blue-800 text-sm">
              View all →
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {topMerchants.map((merchant) => (
              <div key={merchant.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                    {merchant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-2">{merchant.orders} orders</span>
                      <span>★ {merchant.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">ETB {merchant.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-500 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    {merchant.growth}% growth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
        </div>
        <div className="divide-y">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-3 flex items-center hover:bg-gray-50">
              <div className="flex-shrink-0 mr-3">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.action}</span>
                  <span className="text-gray-600"> by {activity.user}</span>
                </p>
              </div>
              <div className="text-xs text-gray-400">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition group">
          <MoreHorizontal className="w-6 h-6" />
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
            <div className="py-2">
              <Link to="/merchants/add" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Add New Merchant
              </Link>
              <Link to="/products/add" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Add New Product
              </Link>
              <Link to="/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Generate Report
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </Link>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;