// src/pages/Dashboard.jsx - ENHANCED DESIGN (functionality preserved)
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Users, Store, Bike, Package, ShoppingBag,
  DollarSign, Clock, CheckCircle, AlertTriangle,
  Activity, Calendar, ArrowUp, MoreHorizontal, Bell,
  TrendingUp, TrendingDown, Star, MapPin, Phone,
  Download, Filter, ChevronDown, RefreshCw, Eye,
  FileText, Share2, Printer, BarChart3, XCircle,
  UserCheck, AlertCircle, Loader2, Zap, ArrowUpRight
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

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS – injected once at component mount
   ───────────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('dash-styles')) return;
  const style = document.createElement('style');
  style.id = 'dash-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

    .dash-root { font-family: 'DM Sans', sans-serif; }
    .dash-mono  { font-family: 'DM Mono', monospace; }

    /* ── light tokens ── */
    .dash-root {
      --c-bg:          #f0f2f7;
      --c-surface:     #ffffff;
      --c-surface-2:   #f7f8fc;
      --c-border:      #e3e8f0;
      --c-border-2:    #d0d7e6;
      --c-text:        #111827;
      --c-text-2:      #6b7280;
      --c-text-3:      #9ca3af;
      --c-blue:        #2563eb;
      --c-blue-soft:   #dbeafe;
      --c-green:       #059669;
      --c-green-soft:  #d1fae5;
      --c-amber:       #d97706;
      --c-amber-soft:  #fef3c7;
      --c-red:         #dc2626;
      --c-red-soft:    #fee2e2;
      --c-purple:      #7c3aed;
      --c-purple-soft: #ede9fe;
      --c-shadow-sm:   0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
      --c-shadow:      0 4px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04);
      --c-shadow-lg:   0 12px 40px rgba(0,0,0,.12);
    }

    /* ── dark tokens ── */
    .dark .dash-root {
      --c-bg:          #0d1117;
      --c-surface:     #161b22;
      --c-surface-2:   #1c2230;
      --c-border:      #2a3347;
      --c-border-2:    #364159;
      --c-text:        #e6edf3;
      --c-text-2:      #8b949e;
      --c-text-3:      #586069;
      --c-blue-soft:   rgba(37,99,235,.18);
      --c-green-soft:  rgba(5,150,105,.18);
      --c-amber-soft:  rgba(217,119,6,.18);
      --c-red-soft:    rgba(220,38,38,.18);
      --c-purple-soft: rgba(124,58,237,.18);
      --c-shadow-sm:   0 1px 3px rgba(0,0,0,.4);
      --c-shadow:      0 4px 16px rgba(0,0,0,.4);
      --c-shadow-lg:   0 12px 40px rgba(0,0,0,.5);
    }

    /* ── card ── */
    .dash-card {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: 14px;
      box-shadow: var(--c-shadow-sm);
      transition: box-shadow .2s, border-color .2s;
    }
    .dash-card:hover { box-shadow: var(--c-shadow); }

    /* ── stat card ── */
    .dash-stat-icon {
      width: 44px; height: 44px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── badge pill ── */
    .dash-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px;
      font-size: .72rem; font-weight: 600; letter-spacing: .02em;
    }

    /* ── section header ── */
    .dash-section-title {
      font-size: .7rem; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; color: var(--c-text-3);
      margin-bottom: 16px;
    }

    /* ── table ── */
    .dash-table-head th {
      padding: 10px 16px; font-size: .68rem; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      color: var(--c-text-3); background: var(--c-surface-2);
      border-bottom: 1px solid var(--c-border);
    }
    .dash-table-body tr {
      border-bottom: 1px solid var(--c-border);
      transition: background .15s;
    }
    .dash-table-body tr:last-child { border-bottom: none; }
    .dash-table-body tr:hover { background: var(--c-surface-2); }
    .dash-table-body td { padding: 12px 16px; font-size: .875rem; color: var(--c-text); }

    /* ── quick-action card ── */
    .dash-action-card {
      border-radius: 12px; padding: 20px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
      transition: transform .18s, box-shadow .18s;
      color: #fff; text-decoration: none;
    }
    .dash-action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }

    /* ── activity row ── */
    .dash-activity-row {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--c-border);
      transition: background .15s;
    }
    .dash-activity-row:last-child { border-bottom: none; }
    .dash-activity-row:hover { background: var(--c-surface-2); }
    .dash-activity-icon {
      width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── pulse dot ── */
    .dash-pulse { position: relative; display: inline-flex; }
    .dash-pulse::after {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: currentColor; opacity: .4;
      animation: pulse-ring 1.5s ease-out infinite;
    }
    @keyframes pulse-ring { 0% { transform: scale(1); opacity: .4; } 100% { transform: scale(2.2); opacity: 0; } }

    /* ── metric accent bar ── */
    .dash-accent-bar {
      height: 3px; border-radius: 99px; margin-top: 12px;
      background: linear-gradient(90deg, currentColor 0%, transparent 100%);
      opacity: .35;
    }

    /* ── top merchant row ── */
    .dash-merchant-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-radius: 10px; cursor: pointer;
      transition: background .15s;
    }
    .dash-merchant-row:hover { background: var(--c-surface-2); }

    /* ── export menu ── */
    .dash-export-menu {
      position: absolute; right: 0; top: calc(100% + 8px);
      min-width: 180px; border-radius: 12px; overflow: hidden;
      background: var(--c-surface); border: 1px solid var(--c-border);
      box-shadow: var(--c-shadow-lg); z-index: 100;
    }
    .dash-export-item {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 11px 16px; background: none; border: none;
      font-size: .875rem; font-family: 'DM Sans', sans-serif;
      color: var(--c-text); cursor: pointer; transition: background .12s;
      text-align: left;
    }
    .dash-export-item:hover { background: var(--c-surface-2); }

    /* ── chart tooltip ── */
    .dash-tooltip {
      border-radius: 10px; padding: 10px 14px; font-family: 'DM Sans', sans-serif;
      background: var(--c-surface) !important;
      border: 1px solid var(--c-border) !important;
      box-shadow: var(--c-shadow);
    }

    /* ── page fade-in ── */
    @keyframes dash-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .dash-fade { animation: dash-fade .35s ease both; }
    .dash-fade-1 { animation-delay: .06s; }
    .dash-fade-2 { animation-delay: .12s; }
    .dash-fade-3 { animation-delay: .18s; }
    .dash-fade-4 { animation-delay: .24s; }
    .dash-fade-5 { animation-delay: .30s; }

    /* ── select reset ── */
    .dash-select {
      background: none; border: none; outline: none;
      font-family: 'DM Sans', sans-serif; font-size: .875rem;
      color: var(--c-text); cursor: pointer;
    }

    /* ── btn ── */
    .dash-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-radius: 9px; font-size: .875rem;
      font-family: 'DM Sans', sans-serif; font-weight: 500;
      background: var(--c-surface); border: 1px solid var(--c-border);
      color: var(--c-text); cursor: pointer; transition: background .15s, box-shadow .15s;
      box-shadow: var(--c-shadow-sm);
    }
    .dash-btn:hover { background: var(--c-surface-2); }
    .dash-btn:disabled { opacity: .5; }
    .dash-btn-primary {
      background: var(--c-blue); border-color: var(--c-blue); color: #fff;
    }
    .dash-btn-primary:hover { opacity: .9; }

    /* ── alert strip ── */
    .dash-alert {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: 12px; border-left: 4px solid var(--c-amber);
      background: var(--c-surface); border: 1px solid var(--c-border);
      border-left: 4px solid var(--c-amber);
    }

    /* ── status badge colors ── */
    .badge-pending  { background: var(--c-amber-soft); color: var(--c-amber); }
    .badge-processing { background: var(--c-blue-soft);  color: var(--c-blue);  }
    .badge-delivered  { background: var(--c-green-soft); color: var(--c-green); }
    .badge-cancelled  { background: var(--c-red-soft);   color: var(--c-red);   }
    
    /* ── category breakdown list ── */
    .category-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid var(--c-border);
      transition: background .15s;
    }
    .category-item:last-child { border-bottom: none; }
    .category-item:hover { background: var(--c-surface-2); padding-left: 8px; border-radius: 8px; }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────────────────────
   FORMAT CURRENCY HELPER
   ───────────────────────────────────────────────────────────── */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('ETB', 'ETB ');
};

/* ─────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
   ───────────────────────────────────────────────────────────── */
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

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { fetchDashboardData(); }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await apiClient.get('/admin/dashboard', { params: { range: dateRange } });
      const data = response.data;
      
      // Set stats with proper fallbacks
      setStats({
        revenue: data.revenue || { today: 0, week: 0, month: 0, growth: 0 },
        orders: data.orders || { total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 },
        users: data.users || { total: 0, active: 0, new: 0, merchants: 0, riders: 0 },
        performance: data.performance || { avgDeliveryTime: 30, onTimeRate: 94.2, satisfaction: 4.6, conversionRate: 3.2 }
      });
      
      setRevenueData(data.revenueChart || []);
      setOrderStatusData(data.orderStatusChart || []);
      setUserGrowthData(data.userGrowthChart || []);
      
      // Enhanced category data handling with revenue by category
      if (data.categoryChart && Array.isArray(data.categoryChart)) {
        // Ensure category data has proper structure with name and revenue
        setCategoryData(data.categoryChart.map(cat => ({
          name: cat.name || cat.category || 'Unknown',
          value: cat.revenue || cat.value || 0,
          orderCount: cat.orderCount || cat.orders || 0,
          percentage: cat.percentage || 0,
          growth: cat.growth || 0
        })));
      } else {
        setCategoryData([]);
      }
      
      setRecentOrders(data.recentOrders || []);
      setTopMerchants(data.topMerchants || []);
      setRecentActivities(data.recentActivities || []);
      setPendingApprovals(data.pendingApprovals || 0);
      setLowStockCount(data.lowStockCount || 0);
      setSystemHealth(data.systemHealth || '98.5%');
      setActiveOrdersNow(data.activeOrdersNow || 0);
      setTodayOrders(data.todayOrders || 0);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response?.status === 404) setError('Dashboard API endpoint not found.');
      else if (err.response?.status === 500) setError(`Server error: ${err.response?.data?.message}`);
      else if (err.code === 'ERR_NETWORK') setError('Cannot connect to API server.');
      else setError(`Failed to load: ${err.message}`);
      showToast.error('Failed to load dashboard data');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const handleExport = (format) => {
    setShowExportMenu(false);
    if (format === 'csv') {
      const csv = generateCSV();
      downloadFile(csv, `dashboard-${dateRange}.csv`, 'text/csv');
      showToast.success('Dashboard exported as CSV');
    } else if (format === 'pdf') {
      window.print();
    } else if (format === 'json') {
      const json = JSON.stringify({ stats, revenueData, orderStatusData, userGrowthData, categoryData, topMerchants, recentOrders }, null, 2);
      downloadFile(json, `dashboard-${dateRange}.json`, 'application/json');
      showToast.success('Dashboard exported as JSON');
    }
  };

  const generateCSV = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Revenue,${stats.revenue?.month || 0}\nTotal Orders,${stats.orders?.total || 0}\nActive Users,${stats.users?.active || 0}\n`;
    csv += `Pending Approvals,${pendingApprovals}\nLow Stock Items,${lowStockCount}\n`;
    csv += '\nTop Merchants\nName,Revenue,Orders,Rating,Growth\n';
    topMerchants.forEach(m => csv += `"${m.name}",${m.revenue || 0},${m.orders || 0},${m.rating || 0},${m.growth || 0}%\n`);
    csv += '\nRecent Orders\nOrder ID,Customer,Amount,Status,Time\n';
    recentOrders.forEach(o => csv += `${o.id},"${o.customer}",${o.amount || 0},${o.status},"${o.time}"\n`);
    return csv;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status) => {
    const map = { pending: 'badge-pending', processing: 'badge-processing', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
    return `dash-badge ${map[status] || ''}`;
  };

  const getActivityMeta = (type) => {
    const map = {
      order:    { icon: <ShoppingBag className="w-4 h-4" />, bg: 'var(--c-blue-soft)',   color: 'var(--c-blue)'   },
      merchant: { icon: <Store className="w-4 h-4" />,       bg: 'var(--c-green-soft)',  color: 'var(--c-green)'  },
      delivery: { icon: <Bike className="w-4 h-4" />,        bg: 'var(--c-purple-soft)', color: 'var(--c-purple)' },
      payment:  { icon: <DollarSign className="w-4 h-4" />,  bg: 'var(--c-green-soft)',  color: 'var(--c-green)'  },
      alert:    { icon: <AlertTriangle className="w-4 h-4" />,bg: 'var(--c-amber-soft)', color: 'var(--c-amber)'  },
      user:     { icon: <Users className="w-4 h-4" />,       bg: 'var(--c-purple-soft)', color: 'var(--c-purple)' },
    };
    return map[type] || { icon: <Activity className="w-4 h-4" />, bg: 'var(--c-surface-2)', color: 'var(--c-text-2)' };
  };

  const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="dash-tooltip dash-mono">
        <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ fontSize: '.82rem', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--c-text-2)' }}>{entry.name}:</span>
            <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  // Calculate total category revenue for percentage display
  const totalCategoryRevenue = categoryData.reduce((sum, cat) => sum + (cat.value || 0), 0);

  if (loading && !refreshing) return (
    <div className={`dash-root p-6 min-h-screen`} style={{ background: 'var(--c-bg)' }}>
      <DashboardSkeleton />
    </div>
  );

  if (error && !refreshing) return (
    <div className="dash-root p-6 min-h-screen" style={{ background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--c-red-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertCircle style={{ width: 32, height: 32, color: 'var(--c-red)' }} />
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>Connection Error</h2>
        <p style={{ color: 'var(--c-text-2)', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button onClick={handleRefresh} className="dash-btn dash-btn-primary" style={{ margin: '0 auto' }}>
          <RefreshCw style={{ width: 15, height: 15 }} /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="dash-root" style={{ background: 'var(--c-bg)', minHeight: '100vh', padding: '28px 28px 48px' }}>

      {/* ── Header ── */}
      <div className="dash-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="dash-section-title" style={{ marginBottom: 4 }}>Overview</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em', lineHeight: 1.2 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--c-text-2)', marginTop: 4, fontSize: '.9rem' }}>Welcome back — here's what's happening today.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date range */}
          <div className="dash-btn" style={{ gap: 8 }}>
            <Calendar style={{ width: 15, height: 15, color: 'var(--c-text-2)', flexShrink: 0 }} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="dash-select"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Refresh */}
          <button onClick={handleRefresh} disabled={refreshing} className="dash-btn">
            <RefreshCw style={{ width: 15, height: 15, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span className="dash-hide-mobile">Refresh</span>
          </button>

          {/* Export */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="dash-btn">
              <Download style={{ width: 15, height: 15 }} />
              Export
              <ChevronDown style={{ width: 13, height: 13, color: 'var(--c-text-3)' }} />
            </button>
            {showExportMenu && (
              <div className="dash-export-menu">
                <button onClick={() => handleExport('csv')} className="dash-export-item">
                  <FileText style={{ width: 15, height: 15, color: 'var(--c-text-2)' }} /> Export CSV
                </button>
                <button onClick={() => handleExport('json')} className="dash-export-item">
                  <Share2 style={{ width: 15, height: 15, color: 'var(--c-text-2)' }} /> Export JSON
                </button>
                <button onClick={() => handleExport('pdf')} className="dash-export-item">
                  <Printer style={{ width: 15, height: 15, color: 'var(--c-text-2)' }} /> Print / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dash-fade dash-fade-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Revenue */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="dash-stat-icon" style={{ background: 'var(--c-green-soft)' }}>
              <DollarSign style={{ width: 20, height: 20, color: 'var(--c-green)' }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600, color: (stats.revenue?.growth || 0) > 0 ? 'var(--c-green)' : 'var(--c-red)' }}>
              {(stats.revenue?.growth || 0) > 0 ? <TrendingUp style={{ width: 14, height: 14 }} /> : <TrendingDown style={{ width: 14, height: 14 }} />}
              {stats.revenue?.growth || 0}%
            </span>
          </div>
          <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>Total Revenue</p>
          <p className="dash-mono" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
            {formatCurrency(stats.revenue?.month || 0)}
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '.72rem', color: 'var(--c-text-3)' }}>
            <span>Today: <strong style={{ color: 'var(--c-text-2)' }}>{formatCurrency(stats.revenue?.today || 0)}</strong></span>
            <span>Week: <strong style={{ color: 'var(--c-text-2)' }}>{formatCurrency(stats.revenue?.week || 0)}</strong></span>
          </div>
          <div className="dash-accent-bar" style={{ color: 'var(--c-green)' }} />
        </div>

        {/* Orders */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="dash-stat-icon" style={{ background: 'var(--c-blue-soft)' }}>
              <ShoppingBag style={{ width: 20, height: 20, color: 'var(--c-blue)' }} />
            </div>
            <Link to="/orders" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowUpRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>Total Orders</p>
          <p className="dash-mono" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
            {stats.orders?.total || 0}
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '.72rem', color: 'var(--c-text-3)' }}>
            <span style={{ color: 'var(--c-amber)' }}>● Pending: <strong>{stats.orders?.pending || 0}</strong></span>
            <span style={{ color: 'var(--c-blue)' }}>● Active: <strong>{activeOrdersNow}</strong></span>
          </div>
          <div className="dash-accent-bar" style={{ color: 'var(--c-blue)' }} />
        </div>

        {/* Users */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="dash-stat-icon" style={{ background: 'var(--c-purple-soft)' }}>
              <Users style={{ width: 20, height: 20, color: 'var(--c-purple)' }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600, color: 'var(--c-green)' }}>
              <TrendingUp style={{ width: 14, height: 14 }} /> +{stats.users?.new || 0} today
            </span>
          </div>
          <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>Total Users</p>
          <p className="dash-mono" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
            {stats.users?.total?.toLocaleString() || '0'}
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '.72rem', color: 'var(--c-text-3)' }}>
            <span>Active: <strong style={{ color: 'var(--c-text-2)' }}>{stats.users?.active?.toLocaleString() || '0'}</strong></span>
            <span>Merchants: <strong style={{ color: 'var(--c-text-2)' }}>{stats.users?.merchants || '0'}</strong></span>
          </div>
          <div className="dash-accent-bar" style={{ color: 'var(--c-purple)' }} />
        </div>

        {/* Performance */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="dash-stat-icon" style={{ background: 'var(--c-amber-soft)' }}>
              <Clock style={{ width: 20, height: 20, color: 'var(--c-amber)' }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 600, color: 'var(--c-green)' }}>
              <CheckCircle style={{ width: 14, height: 14 }} /> {stats.performance?.onTimeRate || 0}%
            </span>
          </div>
          <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>Avg. Delivery Time</p>
          <p className="dash-mono" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
            {stats.performance?.avgDeliveryTime || 0} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--c-text-3)' }}>min</span>
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: '.72rem', color: 'var(--c-text-3)' }}>
            <span>Rating: <strong style={{ color: 'var(--c-text-2)' }}>{stats.performance?.satisfaction || 0} ★</strong></span>
            <span>Conv: <strong style={{ color: 'var(--c-text-2)' }}>{stats.performance?.conversionRate || 0}%</strong></span>
          </div>
          <div className="dash-accent-bar" style={{ color: 'var(--c-amber)' }} />
        </div>
      </div>

      {/* ── Quick Stats Strip ── */}
      <div className="dash-fade dash-fade-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Pending Approvals', value: pendingApprovals, color: pendingApprovals > 0 ? 'var(--c-amber)' : 'var(--c-green)', link: '/admin/approvals', linkLabel: 'Review →' },
          { label: 'Active Riders',     value: stats.users?.riders || 0, color: 'var(--c-green)' },
          { label: 'Merchants',         value: stats.users?.merchants || 0, color: 'var(--c-blue)' },
          { label: "Today's Orders",    value: todayOrders, color: 'var(--c-purple)' },
          { label: 'System Health',     value: systemHealth, color: 'var(--c-green)' },
        ].map((item, i) => (
          <div key={i} className="dash-card" style={{ padding: '16px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--c-text-3)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</p>
            <p className="dash-mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: item.color }}>{item.value}</p>
            {item.link && <Link to={item.link} style={{ fontSize: '.7rem', color: 'var(--c-blue)', textDecoration: 'none' }}>{item.linkLabel}</Link>}
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="dash-fade dash-fade-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginBottom: 20 }}>
        
        {/* Revenue Overview */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p className="dash-section-title" style={{ marginBottom: 2 }}>Revenue Overview</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Monthly Trend</h2>
            </div>
            <span style={{ fontSize: '.78rem', fontWeight: 600, color: (stats.revenue?.growth || 0) > 0 ? 'var(--c-green)' : 'var(--c-red)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {(stats.revenue?.growth || 0) > 0 ? <TrendingUp style={{ width: 14, height: 14 }} /> : <TrendingDown style={{ width: 14, height: 14 }} />}
              {(stats.revenue?.growth || 0) > 0 ? '+' : ''}{stats.revenue?.growth || 0}%
            </span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `${(val / 1000)}k`} tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="default" title="No data" description="Revenue chart will populate once orders are delivered." />}
        </div>

        {/* Orders Overview */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p className="dash-section-title" style={{ marginBottom: 2 }}>Orders Overview</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Status Breakdown</h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['#FBBF24','Pending'],['#60A5FA','Processing'],['#34D399','Delivered']].map(([c,l])=>(
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: 'var(--c-text-2)', fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={orderStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pending" fill="#FBBF24" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="processing" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="delivered" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="default" title="No data" description="Order status chart will appear once orders are placed." />}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="dash-fade dash-fade-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginBottom: 28 }}>

        {/* User Growth */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p className="dash-section-title" style={{ marginBottom: 2 }}>User Growth</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>By Role</h2>
            </div>
            <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c-green)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendingUp style={{ width: 14, height: 14 }} /> +{stats.users?.new || 0} new today
            </span>
          </div>
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--c-text-3)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '.78rem', fontFamily: 'DM Sans' }} />
                <Line type="monotone" dataKey="customers" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3, fill: '#7C3AED', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="merchants" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="riders" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="user" title="No data" description="User growth will be tracked over time." />}
        </div>

        {/* Revenue by Category - Enhanced with real data */}
        <div className="dash-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p className="dash-section-title" style={{ marginBottom: 2 }}>Revenue by Category</p>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Distribution & Breakdown</h2>
            </div>
            <BarChart3 style={{ width: 18, height: 18, color: 'var(--c-blue)' }} />
          </div>
          
          {categoryData.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Pie Chart */}
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} 
                      outerRadius={80} 
                      dataKey="value"
                      strokeWidth={2}
                      stroke="var(--c-surface)"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  {categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: '.7rem', color: 'var(--c-text-2)' }}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category Breakdown List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {categoryData.map((cat, idx) => {
                  const percentage = totalCategoryRevenue > 0 ? ((cat.value / totalCategoryRevenue) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="category-item" style={{ padding: '8px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--c-text)' }}>
                            {cat.name}
                          </span>
                          <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--c-text)', fontFamily: 'DM Mono, monospace' }}>
                            {formatCurrency(cat.value)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '.7rem', color: 'var(--c-text-3)' }}>
                            {cat.orderCount || 0} orders
                          </span>
                          <span style={{ fontSize: '.7rem', fontWeight: 600, color: COLORS[idx % COLORS.length] }}>
                            {percentage}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ 
                          width: '100%', 
                          height: 4, 
                          background: 'var(--c-surface-2)', 
                          borderRadius: 99,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${percentage}%`,
                            background: COLORS[idx % COLORS.length],
                            borderRadius: 99,
                            transition: 'width .3s ease'
                          }} />
                        </div>
                        {cat.growth !== undefined && (
                          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {cat.growth > 0 ? (
                              <TrendingUp style={{ width: 10, height: 10, color: 'var(--c-green)' }} />
                            ) : (
                              <TrendingDown style={{ width: 10, height: 10, color: 'var(--c-red)' }} />
                            )}
                            <span style={{ 
                              fontSize: '.68rem', 
                              fontWeight: 600, 
                              color: cat.growth > 0 ? 'var(--c-green)' : 'var(--c-red)'
                            }}>
                              {cat.growth > 0 ? '+' : ''}{cat.growth}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Total summary */}
                <div style={{ 
                  marginTop: 8, 
                  paddingTop: 8, 
                  borderTop: '2px solid var(--c-border)',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: 700
                }}>
                  <span style={{ fontSize: '.85rem', color: 'var(--c-text)' }}>Total</span>
                  <span style={{ fontSize: '.85rem', color: 'var(--c-text)', fontFamily: 'DM Mono, monospace' }}>
                    {formatCurrency(totalCategoryRevenue)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState 
              icon="default" 
              title="No data" 
              description="Category revenue breakdown will appear once orders are delivered and categories are assigned." 
            />
          )}
        </div>
      </div>

      {/* ── Recent Orders + Top Merchants ── */}
      <div className="dash-fade dash-fade-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginBottom: 20 }}>

        {/* Recent Orders */}
        <div className="dash-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Recent Orders</h2>
            <Link to="/orders" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowUpRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead className="dash-table-head"><tr>
                  <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Time</th>
                </tr></thead>
                <tbody className="dash-table-body">
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><span className="dash-mono" style={{ fontSize: '.8rem', fontWeight: 500 }}>{o.id}</span></td>
                      <td>{o.customer}</td>
                      <td><span className="dash-mono">{formatCurrency(o.amount || 0)}</span></td>
                      <td><span className={getStatusBadgeClass(o.status)}>{o.status}</span></td>
                      <td style={{ color: 'var(--c-text-3)', fontSize: '.78rem' }}>{o.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{ padding: 20 }}><EmptyState icon="order" title="No orders yet" description="Orders will appear here." /></div>}
        </div>

        {/* Top Merchants */}
        <div className="dash-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Top Merchants</h2>
            <Link to="/merchants" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowUpRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {topMerchants.length > 0 ? (
            <div style={{ padding: '8px 12px' }}>
              {topMerchants.map(m => (
                <div key={m.id} className="dash-merchant-row" onClick={() => navigate(`/merchant/${m.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.9rem', flexShrink: 0 }}>
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--c-text)' }}>{m.name}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--c-text-3)', marginTop: 2 }}>
                        {m.orders} orders · ★ {m.rating}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="dash-mono" style={{ fontWeight: 700, color: 'var(--c-green)', fontSize: '.9rem' }}>{formatCurrency(m.revenue || 0)}</p>
                    <p style={{ fontSize: '.72rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2, color: m.growth > 0 ? 'var(--c-green)' : 'var(--c-red)' }}>
                      {m.growth > 0 ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}
                      {m.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ padding: 20 }}><EmptyState icon="user" title="No top merchants" /></div>}
        </div>
      </div>

      {/* ── Recent Activities ── */}
      <div className="dash-card dash-fade dash-fade-5" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--c-border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>Recent Activity</h2>
        </div>
        {recentActivities.length > 0 ? (
          recentActivities.map(a => {
            const meta = getActivityMeta(a.type);
            return (
              <div key={a.id} className="dash-activity-row">
                <div className="dash-activity-icon" style={{ background: meta.bg }}>
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '.875rem', color: 'var(--c-text)', lineHeight: 1.4 }}>
                    <strong>{a.action}</strong>
                    <span style={{ color: 'var(--c-text-2)' }}> by {a.user}</span>
                  </p>
                </div>
                <span style={{ fontSize: '.72rem', color: 'var(--c-text-3)', flexShrink: 0 }}>{a.time}</span>
              </div>
            );
          })
        ) : <div style={{ padding: 20 }}><EmptyState icon="default" title="No recent activity" /></div>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MERCHANT DASHBOARD
   ───────────────────────────────────────────────────────────── */
const MerchantDashboardView = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    activeOrders: 0, 
    avgRating: 0, 
    totalProducts: 0, 
    lowStockCount: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectStyles(); }, []);
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

  if (loading) return (
    <div className="dash-root" style={{ background: 'var(--c-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 style={{ width: 32, height: 32, color: 'var(--c-blue)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const merchantId = user?.merchant?.id;

  return (
    <div className="dash-root" style={{ background: 'var(--c-bg)', minHeight: '100vh', padding: '28px 28px 48px' }}>
      <div className="dash-fade" style={{ marginBottom: 28 }}>
        <p className="dash-section-title">Merchant Portal</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
          Welcome back, {user?.firstName || 'Merchant'}!
        </h1>
        <p style={{ color: 'var(--c-text-2)', marginTop: 4, fontSize: '.9rem' }}>Here's what's happening with your store today.</p>
      </div>

      {/* KPI cards */}
      <div className="dash-fade dash-fade-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <DollarSign />, bg: 'var(--c-green-soft)', color: 'var(--c-green)', accent: 'var(--c-green)' },
          { label: 'Total Orders',  value: stats.totalOrders, icon: <ShoppingBag />, bg: 'var(--c-blue-soft)', color: 'var(--c-blue)', accent: 'var(--c-blue)' },
          { label: 'Active Orders', value: stats.activeOrders, icon: <Clock />, bg: 'var(--c-amber-soft)', color: 'var(--c-amber)', accent: 'var(--c-amber)' },
          { label: 'Avg. Rating',   value: `${stats.avgRating.toFixed(1)} / 5`, icon: <Star />, bg: 'var(--c-amber-soft)', color: 'var(--c-amber)', accent: 'var(--c-amber)' },
        ].map((s, i) => (
          <div key={i} className="dash-card" style={{ padding: '22px 24px' }}>
            <div className="dash-stat-icon" style={{ background: s.bg, marginBottom: 14 }}>
              <span style={{ width: 20, height: 20, color: s.color, display: 'flex' }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>{s.label}</p>
            <p className="dash-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>{s.value}</p>
            <div className="dash-accent-bar" style={{ color: s.accent }} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="dash-fade dash-fade-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Products',   path: 'products',  icon: Package,   gradient: 'linear-gradient(135deg,#2563EB,#3B82F6)' },
          { label: 'Orders',     path: 'orders',    icon: ShoppingBag, gradient: 'linear-gradient(135deg,#059669,#10B981)' },
          { label: 'Inventory',  path: 'inventory', icon: BarChart3, gradient: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' },
          { label: 'Analytics',  path: 'analytics', icon: TrendingUp, gradient: 'linear-gradient(135deg,#D97706,#F59E0B)' },
        ].map((action, idx) => (
          <Link key={idx} to={`/merchant/${merchantId}/${action.path}`} className="dash-action-card" style={{ background: action.gradient }}>
            <action.icon style={{ width: 24, height: 24 }} />
            <span>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Low stock alert */}
      {stats.lowStockCount > 0 && (
        <div className="dash-alert dash-fade dash-fade-3">
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--c-amber-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: 'var(--c-amber)' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, color: 'var(--c-text)', marginBottom: 2 }}>Low Stock Alert</h3>
            <p style={{ fontSize: '.875rem', color: 'var(--c-text-2)' }}>You have <strong>{stats.lowStockCount}</strong> products running low on stock.</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   RIDER DASHBOARD
   ───────────────────────────────────────────────────────────── */
const RiderDashboardView = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    todayDeliveries: 0, 
    totalEarnings: 0, 
    rating: 0, 
    onlineStatus: false 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => {
    fetchRiderStats();
  }, []);

  const fetchRiderStats = async () => {
    try {
      const response = await apiClient.get('/rider/dashboard/stats');
      const data = response.data;
      setStats({
        todayDeliveries: data.todayDeliveries || 0,
        totalEarnings: data.totalEarnings || 0,
        rating: data.rating || 0,
        onlineStatus: data.onlineStatus || false
      });
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      // Fallback to default values if API fails
      setStats({
        todayDeliveries: 8,
        totalEarnings: 1250,
        rating: 4.8,
        onlineStatus: true
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      await apiClient.post('/rider/toggle-status');
      setStats(prev => ({ ...prev, onlineStatus: !prev.onlineStatus }));
      showToast.success(stats.onlineStatus ? 'You are now offline' : 'You are now online');
    } catch (error) {
      showToast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="dash-root" style={{ background: 'var(--c-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 style={{ width: 32, height: 32, color: 'var(--c-blue)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="dash-root" style={{ background: 'var(--c-bg)', minHeight: '100vh', padding: '28px 28px 48px' }}>
      <div className="dash-fade" style={{ marginBottom: 28 }}>
        <p className="dash-section-title">Rider Dashboard</p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>
          Welcome back, {user?.firstName || 'Rider'}!
        </h1>
      </div>

      {/* Status card */}
      <div className="dash-card dash-fade dash-fade-1" style={{ padding: '24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              background: stats.onlineStatus ? 'var(--c-green)' : 'var(--c-text-3)' 
            }} className={stats.onlineStatus ? 'dash-pulse' : ''} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '1rem' }}>Your Status</p>
            <p style={{ color: 'var(--c-text-2)', fontSize: '.875rem' }}>
              {stats.onlineStatus ? 'Online — accepting deliveries' : 'Offline'}
            </p>
          </div>
        </div>
        <button 
          onClick={toggleOnlineStatus}
          style={{ 
            padding: '10px 24px', 
            borderRadius: 9, 
            fontFamily: 'DM Sans, sans-serif', 
            fontWeight: 600, 
            fontSize: '.875rem', 
            border: 'none', 
            cursor: 'pointer', 
            background: stats.onlineStatus ? 'var(--c-green)' : 'var(--c-blue)', 
            color: '#fff', 
            transition: 'opacity .15s' 
          }}
        >
          {stats.onlineStatus ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Stats */}
      <div className="dash-fade dash-fade-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: "Today's Deliveries", value: stats.todayDeliveries, icon: <Package />, bg: 'var(--c-blue-soft)', color: 'var(--c-blue)', accent: 'var(--c-blue)' },
          { label: 'Total Earnings',     value: formatCurrency(stats.totalEarnings), icon: <DollarSign />, bg: 'var(--c-green-soft)', color: 'var(--c-green)', accent: 'var(--c-green)' },
          { label: 'Your Rating',        value: `${stats.rating.toFixed(1)} ★`, icon: <Star />, bg: 'var(--c-amber-soft)', color: 'var(--c-amber)', accent: 'var(--c-amber)' },
        ].map((s, i) => (
          <div key={i} className="dash-card" style={{ padding: '22px 24px' }}>
            <div className="dash-stat-icon" style={{ background: s.bg, marginBottom: 14 }}>
              <span style={{ width: 20, height: 20, color: s.color, display: 'flex' }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--c-text-2)', marginBottom: 4 }}>{s.label}</p>
            <p className="dash-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-.02em' }}>{s.value}</p>
            <div className="dash-accent-bar" style={{ color: s.accent }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN ROUTER
   ───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f7' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#2563EB', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  switch (user.role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return <AdminDashboard />;

    case 'MERCHANT': {
      const merchantId = user?.merchant?.id;
      if (merchantId) return <Navigate to={`/merchant/${merchantId}`} replace />;
      return (
        <div className="dash-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--c-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--c-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Store style={{ width: 32, height: 32, color: 'var(--c-text-3)' }} />
            </div>
            <h2 style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 6 }}>No Store Found</h2>
            <p style={{ color: 'var(--c-text-2)', fontSize: '.9rem' }}>Your merchant account is not linked to a store yet.</p>
          </div>
        </div>
      );
    }

    case 'RIDER':
      return <RiderDashboardView />;

    case 'CUSTOMER':
      return (
        <div className="dash-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--c-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--c-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users style={{ width: 32, height: 32, color: 'var(--c-text-3)' }} />
            </div>
            <h2 style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 6 }}>Customer Dashboard</h2>
            <p style={{ color: 'var(--c-text-2)', fontSize: '.9rem' }}>Coming soon</p>
          </div>
        </div>
      );

    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;