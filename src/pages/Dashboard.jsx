// src/pages/Dashboard.jsx - COMPLETE ENHANCED VERSION WITH UI/UX POLISH
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Store, Bike, Package, ShoppingBag,
  DollarSign, Clock, CheckCircle, AlertTriangle,
  Activity, Calendar, ArrowUp, MoreHorizontal, Bell,
  TrendingUp, TrendingDown, Star, MapPin, Phone,
  Download, Filter, ChevronDown, RefreshCw, Eye,
  FileText, Share2, Printer, BarChart3, XCircle,
  UserCheck, AlertCircle, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useNotifications } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';

// ==================== ENHANCED ADMIN DASHBOARD ====================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dateRange, setDateRange] = useState('7d');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [systemHealth, setSystemHealth] = useState('98.5%');
  const [activeOrdersNow, setActiveOrdersNow] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [error, setError] = useState(null);
  const { unreadCount } = useNotifications();
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching dashboard data...');
      
      const response = await apiClient.get('/admin/dashboard', {
        params: { range: dateRange }
      });
      
      console.log('✅ Dashboard data received');
      const data = response.data;

      setStats({
        revenue: data.revenue || { today: 0, week: 0, month: 0, growth: 0 },
        orders: data.orders || { total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 },
        users: data.users || { total: 0, active: 0, new: 0, merchants: 0, riders: 0 },
        performance: data.performance || { avgDeliveryTime: 30, onTimeRate: 94.2, satisfaction: 4.6, conversionRate: 3.2 }
      });

      setRevenueData(data.revenueChart || []);
      setOrderStatusData(data.orderStatusChart || []);
      setUserGrowthData(data.userGrowthChart || []);
      setCategoryData(data.categoryChart || []);
      setRecentOrders(data.recentOrders || []);
      setTopMerchants(data.topMerchants || []);
      setRecentActivities(data.recentActivities || []);
      setPendingApprovals(data.pendingApprovals || 0);
      setLowStockCount(data.lowStockCount || 0);
      setSystemHealth(data.systemHealth || '98.5%');
      setActiveOrdersNow(data.activeOrdersNow || 0);
      setTodayOrders(data.todayOrders || 0);

    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      
      if (err.response?.status === 404) {
        setError('Dashboard API endpoint not found. Please check your backend server.');
      } else if (err.response?.status === 500) {
        setError(`Server error: ${err.response?.data?.message || 'Internal server error'}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to API server. Is the backend running?');
      } else {
        setError(`Failed to load: ${err.message}`);
      }
      
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    showToast.info('Refreshing dashboard...');
    fetchDashboardData();
  };

  const handleExport = (format) => {
    setShowExportMenu(false);
    
    if (format === 'csv') {
      const csv = generateCSV();
      downloadFile(csv, `dashboard-${dateRange}.csv`, 'text/csv');
      showToast.success('Dashboard exported as CSV');
    } else if (format === 'pdf') {
      window.print();
      showToast.info('Opening print dialog...');
    } else if (format === 'json') {
      const dashboardData = { stats, revenueData, orderStatusData, userGrowthData, categoryData, topMerchants, recentOrders };
      const json = JSON.stringify(dashboardData, null, 2);
      downloadFile(json, `dashboard-${dateRange}.json`, 'application/json');
      showToast.success('Dashboard exported as JSON');
    }
  };

  const generateCSV = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Revenue,${stats.revenue?.month || 0}\n`;
    csv += `Total Orders,${stats.orders?.total || 0}\n`;
    csv += `Active Users,${stats.users?.active || 0}\n`;
    csv += `Pending Approvals,${pendingApprovals}\n`;
    csv += `Low Stock Items,${lowStockCount}\n`;
    csv += `Avg Delivery Time,${stats.performance?.avgDeliveryTime || 0} min\n`;
    csv += `On-Time Rate,${stats.performance?.onTimeRate || 0}%\n`;
    csv += `Customer Satisfaction,${stats.performance?.satisfaction || 0}/5\n`;
    csv += '\nTop Merchants\n';
    csv += 'Name,Revenue,Orders,Rating,Growth\n';
    topMerchants.forEach(m => {
      csv += `"${m.name}",${m.revenue || 0},${m.orders || 0},${m.rating || 0},${m.growth || 0}%\n`;
    });
    csv += '\nRecent Orders\n';
    csv += 'Order ID,Customer,Amount,Status,Time\n';
    recentOrders.forEach(o => {
      csv += `${o.id},"${o.customer}",${o.amount || 0},${o.status},"${o.time}"\n`;
    });
    return csv;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: darkMode 
        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
        : 'bg-yellow-100 text-yellow-800',
      processing: darkMode 
        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
        : 'bg-blue-100 text-blue-800',
      delivered: darkMode 
        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
        : 'bg-green-100 text-green-800',
      cancelled: darkMode 
        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
        : 'bg-red-100 text-red-800',
      confirmed: darkMode 
        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
        : 'bg-indigo-100 text-indigo-800',
      preparing: darkMode 
        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
        : 'bg-purple-100 text-purple-800',
      ready: darkMode 
        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
        : 'bg-teal-100 text-teal-800',
      assigned: darkMode 
        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
        : 'bg-orange-100 text-orange-800',
      picked_up: darkMode 
        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
        : 'bg-cyan-100 text-cyan-800',
      in_transit: darkMode 
        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
        : 'bg-sky-100 text-sky-800',
    };
    return colors[status] || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'merchant': return <Store className="w-4 h-4 text-green-500" />;
      case 'delivery': return <Bike className="w-4 h-4 text-purple-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'user': return <Users className="w-4 h-4 text-indigo-500" />;
      case 'system': return <Activity className="w-4 h-4 text-gray-500" />;
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg border px-3 py-2 shadow-lg ${
          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="text-sm font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading State
  if (loading && !refreshing) {
    return (
      <div className={`p-6 min-h-screen ${pageBg}`}>
        <DashboardSkeleton />
      </div>
    );
  }

  // Error State
  if (error && !refreshing) {
    return (
      <div className={`p-6 min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Connection Error
          </h2>
          <p className={`${mutedText} mb-6`}>{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Admin Dashboard
          </h1>
          <p className={`${mutedText} mt-1`}>
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Date Range Selector */}
          <div className={`${cardClass} rounded-lg shadow px-4 py-2 flex items-center gap-2`}>
            <Calendar className={`w-4 h-4 ${mutedText}`} />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                showToast.info(`Loading ${e.target.options[e.target.selectedIndex].text}...`);
              }}
              className={`text-sm bg-transparent border-none outline-none cursor-pointer ${darkMode ? 'text-white' : 'text-gray-700'}`}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${cardClass} rounded-lg shadow px-3 py-2 flex items-center gap-2 transition hover:shadow-md ${refreshing ? 'opacity-50' : ''}`}
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`${cardClass} rounded-lg shadow px-4 py-2 flex items-center gap-2 hover:shadow-md transition`}
              title="Export dashboard data"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showExportMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 rounded-t-lg transition"
                >
                  <FileText className="w-4 h-4" /> Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4" /> Export as JSON
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 rounded-b-lg transition"
                >
                  <Printer className="w-4 h-4" /> Print Report
                </button>
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <div className={`px-4 py-2 rounded-lg flex items-center border shadow-sm ${
              darkMode ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              <Bell className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{unreadCount} new</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition transform hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-green-500/20' : 'bg-green-100'} p-2 rounded-lg`}>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className={`flex items-center text-sm ${stats.revenue?.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.revenue?.growth > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {stats.revenue?.growth || 0}%
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Total Revenue</p>
          <p className="text-2xl font-bold">ETB {stats.revenue?.month?.toLocaleString() || 0}</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Today: ETB {stats.revenue?.today?.toLocaleString() || 0}</span>
            <span>Week: ETB {stats.revenue?.week?.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition transform hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} p-2 rounded-lg`}>
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <Link to="/orders" className="text-blue-500 hover:text-blue-400 text-sm transition">
              View all →
            </Link>
          </div>
          <p className={`${mutedText} text-sm`}>Total Orders</p>
          <p className="text-2xl font-bold">{stats.orders?.total || 0}</p>
          <div className="mt-2 flex text-xs">
            <span className="mr-3 text-yellow-500">Pending: {stats.orders?.pending || 0}</span>
            <span className="text-blue-500">Active: {activeOrdersNow}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition transform hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'} p-2 rounded-lg`}>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              <TrendingUp className="w-4 h-4 mr-1" />+{stats.users?.new || 0} today
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Total Users</p>
          <p className="text-2xl font-bold">{stats.users?.total?.toLocaleString() || 0}</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Active: {stats.users?.active?.toLocaleString() || 0}</span>
            <span>Merchants: {stats.users?.merchants || 0}</span>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition transform hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'} p-2 rounded-lg`}>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />{stats.performance?.onTimeRate || 0}%
            </span>
          </div>
          <p className={`${mutedText} text-sm`}>Avg. Delivery Time</p>
          <p className="text-2xl font-bold">{stats.performance?.avgDeliveryTime || 0} min</p>
          <div className={`mt-2 flex text-xs ${mutedText}`}>
            <span className="mr-3">Rating: {stats.performance?.satisfaction || 0} ★</span>
            <span>Conv: {stats.performance?.conversionRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg p-4 text-center hover:shadow-md transition`}>
          <p className={`${mutedText} text-xs`}>Pending Approvals</p>
          <p className={`text-xl font-bold ${pendingApprovals > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
            {pendingApprovals}
          </p>
          <Link to="/admin/approvals" className="text-blue-500 text-xs hover:underline">Review →</Link>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center hover:shadow-md transition`}>
          <p className={`${mutedText} text-xs`}>Active Riders</p>
          <p className="text-xl font-bold text-green-500">{stats.users?.riders || 0}</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center hover:shadow-md transition`}>
          <p className={`${mutedText} text-xs`}>Total Merchants</p>
          <p className="text-xl font-bold text-blue-500">{stats.users?.merchants || 0}</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center hover:shadow-md transition`}>
          <p className={`${mutedText} text-xs`}>Today's Orders</p>
          <p className="text-xl font-bold text-purple-500">{todayOrders}</p>
        </div>
        <div className={`${cardClass} rounded-lg p-4 text-center hover:shadow-md transition`}>
          <p className={`${mutedText} text-xs`}>System Health</p>
          <p className="text-xl font-bold text-emerald-500">{systemHealth}</p>
        </div>
      </div>

      {/* Charts Row 1 - Revenue & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${stats.revenue?.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.revenue?.growth > 0 ? '+' : ''}{stats.revenue?.growth || 0}%
              </span>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState 
                icon="default"
                title="No revenue data"
                description="Revenue chart will populate once orders are delivered."
              />
            </div>
          )}
        </div>

        {/* Order Status Chart */}
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Orders Overview</h2>
            <div className="flex space-x-3">
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>Pending</span>
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>Processing</span>
              <span className="flex items-center text-xs"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Delivered</span>
            </div>
          </div>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
                <Bar dataKey="pending" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="processing" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState 
                icon="default"
                title="No order data"
                description="Order status chart will appear once orders are placed."
              />
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 - User Growth & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">User Growth</h2>
            <span className="text-sm text-green-500">+{stats.users?.new || 0} new today</span>
          </div>
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="name" stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
                <Line type="monotone" dataKey="customers" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="merchants" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="riders" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState 
                icon="user"
                title="No growth data"
                description="User growth will be tracked over time as new users join."
              />
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue by Category</h2>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <EmptyState 
                icon="default"
                title="No category data"
                description="Category breakdown will appear once orders are delivered."
              />
            </div>
          )}
        </div>
      </div>

      {/* Orders Table + Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders Table */}
        <div className={`${cardClass} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${divider} flex justify-between items-center`}>
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-blue-500 hover:text-blue-400 text-sm transition">
              View all →
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className={hoverRow}>
                      <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.customer || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm">ETB {order.amount?.toLocaleString() || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-xs ${mutedText}`}>{order.time || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState 
              icon="order"
              title="No orders yet"
              description="Orders will appear here once customers start placing them."
              action={() => navigate('/merchants')}
              actionLabel="Browse Merchants"
            />
          )}
        </div>

        {/* Top Merchants */}
        <div className={`${cardClass} rounded-lg shadow`}>
          <div className={`px-6 py-4 border-b ${divider} flex justify-between items-center`}>
            <h2 className="text-lg font-semibold">Top Merchants</h2>
            <Link to="/merchants" className="text-blue-500 hover:text-blue-400 text-sm transition">
              View all →
            </Link>
          </div>
          {topMerchants.length > 0 ? (
            <div className="p-4 space-y-4">
              {topMerchants.map((merchant) => (
                <div key={merchant.id} className={`flex items-center justify-between p-3 rounded-lg ${hoverRow} transition cursor-pointer`}
                  onClick={() => navigate(`/merchant/${merchant.id}`)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                      {merchant.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{merchant.name || 'Unknown'}</p>
                      <div className={`flex items-center text-xs ${mutedText}`}>
                        <span className="mr-2">{merchant.orders || 0} orders</span>
                        <span>★ {merchant.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">ETB {merchant.revenue?.toLocaleString() || 0}</p>
                    <p className={`text-xs flex items-center justify-end ${merchant.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {merchant.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {merchant.growth || 0}% growth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="user"
              title="No top merchants"
              description="Top performing merchants will appear here based on revenue."
            />
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className={`${cardClass} rounded-lg shadow`}>
        <div className={`px-6 py-4 border-b ${divider}`}>
          <h2 className="text-lg font-semibold">Recent Activities</h2>
        </div>
        {recentActivities.length > 0 ? (
          <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`px-6 py-3 flex items-center ${hoverRow} transition`}>
                <div className="flex-shrink-0 mr-3">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.action}</span>
                    <span className={` ${mutedText}`}> by {activity.user}</span>
                  </p>
                </div>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon="default"
            title="No recent activity"
            description="Activities like new orders, merchant registrations, and deliveries will appear here."
          />
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-110" title="Quick actions">
            <MoreHorizontal className="w-6 h-6" />
          </button>
          <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-lg shadow-lg border hidden group-hover:block transition-opacity ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="py-2">
              <Link to="/merchants/add" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition`}>
                ➕ Add New Merchant
              </Link>
              <Link to="/products/add" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition`}>
                📦 Add New Product
              </Link>
              <Link to="/admin/approvals" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition`}>
                ✅ Review Approvals
              </Link>
              <Link to="/settings" className={`block px-4 py-2 text-sm ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition`}>
                ⚙️ Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MERCHANT DASHBOARD ====================
const MerchantDashboardView = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    avgRating: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.merchant?.id) {
      fetchMerchantStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMerchantStats = async () => {
    try {
      const response = await apiClient.get(`/merchants/${user.merchant.id}/stats`);
      const data = response.data;
      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        activeOrders: data.activeOrders || 0,
        avgRating: data.avgRating || 0,
        totalProducts: data.totalProducts || 0,
        lowStockCount: data.lowStockItems?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching merchant stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardClass = darkMode
    ? 'bg-slate-800 border border-slate-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-slate-400' : 'text-gray-600';
  const pageBg = darkMode ? 'bg-slate-900' : 'bg-gray-50';

  const statCards = [
    { label: 'Total Revenue', value: `ETB ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: darkMode ? 'bg-green-500/20' : 'bg-green-100' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-500', bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100' },
    { label: 'Active Orders', value: stats.activeOrders.toString(), icon: Clock, color: 'text-orange-500', bg: darkMode ? 'bg-orange-500/20' : 'bg-orange-100' },
    { label: 'Avg. Rating', value: `${stats.avgRating.toFixed(1)}/5`, icon: Star, color: 'text-yellow-500', bg: darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100' },
  ];

  if (loading) {
    return (
      <div className={`p-6 min-h-screen ${pageBg} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome back, {user?.firstName || 'Merchant'}!
        </h1>
        <p className={`${mutedText} mt-1`}>Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`${cardClass} rounded-lg shadow p-6 hover:shadow-lg transition`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className={`${mutedText} text-sm`}>{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {stats.lowStockCount > 0 && (
        <div className={`${cardClass} rounded-lg shadow p-6 mb-8 border-l-4 border-yellow-500`}>
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-semibold">Low Stock Alert</h3>
              <p className={`${mutedText} text-sm`}>
                You have {stats.lowStockCount} products running low on stock.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`${cardClass} rounded-lg shadow p-6`}>
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <EmptyState 
          icon="order"
          title="No recent orders"
          description="Your recent orders will appear here."
        />
      </div>
    </div>
  );
};

// ==================== RIDER DASHBOARD ====================
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

      <div className={`${cardClass} rounded-lg shadow p-6 mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Your Status</h3>
            <p className={`${mutedText}`}>
              {stats.onlineStatus ? 'You are online and can receive orders' : 'You are offline'}
            </p>
          </div>
          <button className={`px-6 py-3 rounded-lg font-medium transition ${
            stats.onlineStatus 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}>
            {stats.onlineStatus ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

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

      <div className={`${cardClass} rounded-lg shadow p-6`}>
        <h2 className="text-lg font-semibold mb-4">Available Orders</h2>
        <EmptyState 
          icon="order"
          title="No available orders"
          description="New delivery requests will appear here."
        />
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  switch (user.role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    case 'MERCHANT':
      return <MerchantDashboardView />;
    case 'RIDER':
      return <RiderDashboardView />;
    case 'CUSTOMER':
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">Customer Dashboard</h2>
            <p className="text-gray-500 mt-2">Coming Soon</p>
          </div>
        </div>
      );
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;