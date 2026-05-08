// src/pages/Reports.jsx - With Merchant Detail Drill-Down
import { useState, useEffect, useContext } from 'react';
import {
  FileText, Download, RefreshCw, Calendar, TrendingUp,
  Store, DollarSign, Bike, CreditCard, Filter, Search,
  ChevronDown, FileSpreadsheet, Printer, BarChart3,
  Eye, X, User, Phone, Mail, MapPin, Package, ShoppingBag,
  Clock, Star, ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const Reports = () => {
  const { darkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [refreshing, setRefreshing] = useState(false);
  
  // Date range
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [merchants, setMerchants] = useState([]);

  // Report data
  const [salesReport, setSalesReport] = useState(null);
  const [merchantReport, setMerchantReport] = useState([]);
  const [riderReport, setRiderReport] = useState([]);
  const [paymentReport, setPaymentReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Detail states
  const [selectedMerchantDetail, setSelectedMerchantDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, []);

  useEffect(() => {
    fetchCurrentReport();
  }, [activeTab, startDate, endDate, selectedMerchant]);

  const fetchMerchants = async () => {
    try {
      const res = await apiClient.get('/merchants?include=full');
      setMerchants(res.data || []);
    } catch (e) { /* ignore */ }
  };

  const fetchCurrentReport = async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };
      if (selectedMerchant) params.merchantId = selectedMerchant;

      switch (activeTab) {
        case 'sales':
          const salesRes = await apiClient.get('/reports/sales', { params });
          setSalesReport(salesRes.data);
          break;
        case 'merchant':
          const merchRes = await apiClient.get('/reports/merchant-activity', { params });
          setMerchantReport(merchRes.data || []);
          break;
        case 'rider':
          const riderRes = await apiClient.get('/reports/rider-performance', { params });
          setRiderReport(riderRes.data || []);
          break;
        case 'payment':
          const payRes = await apiClient.get('/reports/payments', { params });
          setPaymentReport(payRes.data);
          break;
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      showToast.error('Failed to load report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCurrentReport();
  };

  // View merchant detail
  const handleViewMerchantDetail = async (merchant) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      // Fetch full merchant data with orders
      const res = await apiClient.get(`/merchants/${merchant.id}`);
      const fullMerchant = res.data;
      
      // Fetch orders specifically for this merchant in date range
      const orderParams = { startDate, endDate, merchantId: merchant.id };
      const salesRes = await apiClient.get('/reports/sales', { params: orderParams });
      
      setSelectedMerchantDetail({
        ...fullMerchant,
        reportData: salesRes.data,
      });
    } catch (error) {
      console.error('Error fetching merchant detail:', error);
      showToast.error('Failed to load merchant details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = (format, dataOverride = null) => {
    const data = dataOverride || 
                 (activeTab === 'sales' ? salesReport : 
                  activeTab === 'merchant' ? merchantReport :
                  activeTab === 'rider' ? riderReport : paymentReport);
    
    if (format === 'csv') {
      const csv = generateCSV(data, activeTab);
      downloadFile(csv, `${activeTab}-report-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      showToast.success('CSV exported');
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `${activeTab}-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      showToast.success('JSON exported');
    } else if (format === 'print') {
      window.print();
    }
  };

  const generateCSV = (data, type) => {
    if (!data) return '';
    let csv = '';
    if (type === 'sales' && data.merchants) {
      csv = 'Merchant,Category,Orders,Revenue,Delivered,Cancelled\n';
      data.merchants.forEach(m => {
        csv += `"${m.merchantName}","${m.category}",${m.orders},${m.revenue},${m.delivered},${m.cancelled}\n`;
      });
    } else if (type === 'merchant') {
      csv = 'Business Name,Category,Status,Rating,Products,Period Orders,Period Revenue\n';
      data.forEach(m => {
        csv += `"${m.businessName}","${m.category}","${m.status}",${m.rating},${m.totalProducts},${m.periodOrders},${m.periodRevenue}\n`;
      });
    } else if (type === 'rider') {
      csv = 'Name,Phone,Vehicle,Status,Rating,Completed,Total,Completion Rate,Earnings\n';
      data.forEach(r => {
        csv += `"${r.name}","${r.phone}","${r.vehicleType}","${r.status}",${r.rating},${r.completedOrders},${r.totalOrders},${r.completionRate}%,${r.totalEarnings}\n`;
      });
    } else if (type === 'payment' && data.summary) {
      csv = 'Metric,Value\n';
      csv += `Total Revenue,${data.summary.totalRevenue}\n`;
      csv += `Total Orders,${data.summary.totalOrders}\n`;
    }
    return csv;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-indigo-100 text-indigo-800',
      ASSIGNED: 'bg-orange-100 text-orange-800',
      PICKED_UP: 'bg-teal-100 text-teal-800',
      IN_TRANSIT: 'bg-cyan-100 text-cyan-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'merchant', label: 'Merchant Activity', icon: Store },
    { id: 'rider', label: 'Rider Performance', icon: Bike },
    { id: 'payment', label: 'Payment Summary', icon: CreditCard },
  ];

  const filteredMerchants = merchantReport.filter(m => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (m.businessName || '').toLowerCase().includes(s) || (m.category || '').toLowerCase().includes(s);
  });

  const filteredRiders = riderReport.filter(r => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return r.name?.toLowerCase().includes(s) || r.phone?.includes(s);
  });

  if (loading && !refreshing) {
    return <div className="p-6"><DashboardSkeleton /></div>;
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="inline w-6 h-6 mr-2 text-blue-500" />
            Reports
          </h1>
          <p className={mutedText}>Generate and export detailed business reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'
            }`}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
            </button>
            <div className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg border hidden group-hover:block z-50 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => handleExport('json')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Export JSON
              </button>
              <button onClick={() => handleExport('print')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : `${cardClass} hover:bg-gray-100 dark:hover:bg-gray-700`
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Calendar className={`w-4 h-4 ${mutedText}`} />
          <div className="flex items-center gap-2">
            <span className={`text-sm ${mutedText}`}>From:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${mutedText}`}>To:</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`} />
          </div>
          <select value={selectedMerchant} onChange={(e) => setSelectedMerchant(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}>
            <option value="">All Merchants</option>
            {merchants.map(m => <option key={m.id} value={m.id}>{m.businessName}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${inputClass}`} />
          </div>
        </div>
      </div>

      {/* ===== SALES REPORT ===== */}
      {activeTab === 'sales' && salesReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Total Revenue</p>
              <p className="text-xl font-bold text-green-600">ETB {salesReport.summary?.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Total Orders</p>
              <p className="text-xl font-bold text-blue-600">{salesReport.summary?.totalOrders}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Delivered</p>
              <p className="text-xl font-bold text-green-600">{salesReport.summary?.deliveredOrders}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Avg Order Value</p>
              <p className="text-xl font-bold text-purple-600">ETB {salesReport.summary?.averageOrderValue?.toFixed(0)}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Cancelled</p>
              <p className="text-xl font-bold text-red-600">{salesReport.summary?.cancelledOrders}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {salesReport.daily?.length > 0 && (
              <div className={`${cardClass} rounded-lg shadow p-6`}>
                <h3 className="font-semibold mb-4">Daily Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesReport.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#6b7280'} fontSize={10} />
                    <YAxis stroke={darkMode ? '#cbd5e1' : '#6b7280'} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {salesReport.paymentMethods?.length > 0 && (
              <div className={`${cardClass} rounded-lg shadow p-6`}>
                <h3 className="font-semibold mb-4">Payment Methods</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={salesReport.paymentMethods} dataKey="count" nameKey="method" outerRadius={100} label>
                      {salesReport.paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip /> <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Merchant Breakdown Table with Drill-Down */}
          {salesReport.merchants?.length > 0 && (
            <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">Merchant Breakdown</h3>
                <p className={`text-xs ${mutedText}`}>Click "View" to see detailed orders and payments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium">Merchant</th>
                      <th className="text-left py-3 px-4 text-xs font-medium">Category</th>
                      <th className="text-right py-3 px-4 text-xs font-medium">Orders</th>
                      <th className="text-right py-3 px-4 text-xs font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 text-xs font-medium">Delivered</th>
                      <th className="text-right py-3 px-4 text-xs font-medium">Cancelled</th>
                      <th className="text-center py-3 px-4 text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {salesReport.merchants.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-sm font-medium">{m.merchantName}</td>
                        <td className="py-3 px-4 text-sm">{m.category}</td>
                        <td className="py-3 px-4 text-sm text-right">{m.orders}</td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-green-600">ETB {m.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right">{m.delivered}</td>
                        <td className="py-3 px-4 text-sm text-right text-red-500">{m.cancelled}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewMerchantDetail(m)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== MERCHANT ACTIVITY REPORT ===== */}
      {activeTab === 'merchant' && (
        <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold">Merchant Activity</h3>
            <p className={`text-xs ${mutedText}`}>Click "View" to see detailed orders and payments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium">Business Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Rating</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Products</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Period Orders</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Period Revenue</th>
                  <th className="text-center py-3 px-4 text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredMerchants.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium">{m.businessName}</td>
                    <td className="py-3 px-4 text-sm">{m.category}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{m.status}</span></td>
                    <td className="py-3 px-4 text-sm text-right">⭐ {m.rating?.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-right">{m.totalProducts}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">{m.periodOrders}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold text-green-600">ETB {m.periodRevenue?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewMerchantDetail(m)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== RIDER PERFORMANCE REPORT ===== */}
      {activeTab === 'rider' && (
        <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium">Rider</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Vehicle</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Rating</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Completed</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredRiders.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-medium">{r.name}</td>
                    <td className="py-3 px-4 text-sm">{r.phone}</td>
                    <td className="py-3 px-4 text-sm">{r.vehicleType}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'ONLINE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{r.status}</span></td>
                    <td className="py-3 px-4 text-sm text-right">⭐ {r.rating?.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">{r.completedOrders}</td>
                    <td className="py-3 px-4 text-sm text-right">{r.completionRate}%</td>
                    <td className="py-3 px-4 text-sm text-right font-bold text-green-600">ETB {r.totalEarnings?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PAYMENT SUMMARY REPORT ===== */}
      {activeTab === 'payment' && paymentReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Total Revenue</p>
              <p className="text-xl font-bold text-green-600">ETB {paymentReport.summary?.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Total Orders</p>
              <p className="text-xl font-bold text-blue-600">{paymentReport.summary?.totalOrders}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Pending</p>
              <p className="text-xl font-bold text-yellow-600">ETB {paymentReport.summary?.totalPending?.toLocaleString()}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
              <p className={`text-xs ${mutedText}`}>Failed</p>
              <p className="text-xl font-bold text-red-600">ETB {paymentReport.summary?.totalFailed?.toLocaleString()}</p>
            </div>
          </div>
          {paymentReport.dailyRevenue?.length > 0 && (
            <div className={`${cardClass} rounded-lg shadow p-6`}>
              <h3 className="font-semibold mb-4">Daily Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={paymentReport.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#6b7280'} fontSize={10} />
                  <YAxis stroke={darkMode ? '#cbd5e1' : '#6b7280'} fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ===== MERCHANT DETAIL MODAL ===== */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            {detailLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className={mutedText}>Loading merchant details...</p>
              </div>
            ) : selectedMerchantDetail ? (
              <>
                {/* Modal Header */}
                <div className={`p-6 border-b flex justify-between items-center sticky top-0 z-10 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMerchantDetail.businessName}</h2>
                      <p className={`text-sm ${mutedText}`}>Detailed Order & Payment Report</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleExport('csv', selectedMerchantDetail.reportData)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Merchant Info Cards */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <p className={`text-xs ${mutedText}`}>Category</p>
                      <p className="font-semibold">{selectedMerchantDetail.category || 'N/A'}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <p className={`text-xs ${mutedText}`}>Rating</p>
                      <p className="font-semibold">⭐ {selectedMerchantDetail.rating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <p className={`text-xs ${mutedText}`}>Total Products</p>
                      <p className="font-semibold">{selectedMerchantDetail.products?.length || 0}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <p className={`text-xs ${mutedText}`}>Contact</p>
                      <p className="font-semibold text-sm">{selectedMerchantDetail.businessPhone}</p>
                    </div>
                  </div>

                  {/* Period Summary */}
                  {selectedMerchantDetail.reportData?.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
                        <p className={`text-xs ${mutedText}`}>Period Revenue</p>
                        <p className="text-xl font-bold text-green-600">ETB {selectedMerchantDetail.reportData.summary.totalRevenue?.toLocaleString()}</p>
                      </div>
                      <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
                        <p className={`text-xs ${mutedText}`}>Period Orders</p>
                        <p className="text-xl font-bold text-blue-600">{selectedMerchantDetail.reportData.summary.totalOrders}</p>
                      </div>
                      <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
                        <p className={`text-xs ${mutedText}`}>Delivered</p>
                        <p className="text-xl font-bold text-green-600">{selectedMerchantDetail.reportData.summary.deliveredOrders}</p>
                      </div>
                      <div className={`${cardClass} rounded-lg shadow p-4 text-center`}>
                        <p className={`text-xs ${mutedText}`}>Avg Order</p>
                        <p className="text-xl font-bold text-purple-600">ETB {selectedMerchantDetail.reportData.summary.averageOrderValue?.toFixed(0)}</p>
                      </div>
                    </div>
                  )}

                  {/* Orders Table */}
                  {selectedMerchantDetail.reportData?.orders?.length > 0 && (
                    <div className={`${cardClass} rounded-lg shadow overflow-hidden mb-6`}>
                      <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="font-semibold">Orders ({selectedMerchantDetail.reportData.orders.length})</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-medium">Order #</th>
                              <th className="text-left py-3 px-4 text-xs font-medium">Customer</th>
                              <th className="text-right py-3 px-4 text-xs font-medium">Amount</th>
                              <th className="text-left py-3 px-4 text-xs font-medium">Payment</th>
                              <th className="text-left py-3 px-4 text-xs font-medium">Status</th>
                              <th className="text-left py-3 px-4 text-xs font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-gray-700">
                            {selectedMerchantDetail.reportData.orders.map((order, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-sm font-mono">{order.orderNumber}</td>
                                <td className="py-3 px-4 text-sm">{order.customer?.firstName} {order.customer?.lastName}</td>
                                <td className="py-3 px-4 text-sm text-right font-bold text-green-600">ETB {order.total?.toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm">{order.paymentMethod}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className={mutedText}>No merchant data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;