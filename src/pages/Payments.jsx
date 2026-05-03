// src/pages/Payments.jsx - CONNECTED TO REAL BACKEND
import { useState, useEffect, useContext } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import {
  DollarSign, CreditCard, TrendingUp, TrendingDown,
  Search, Filter, RefreshCw, Download, Eye,
  CheckCircle, Clock, XCircle, AlertCircle,
  Wallet, Building2, Calendar, ArrowUpRight
} from 'lucide-react';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';

const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const Payments = () => {
  const { darkMode } = useContext(ThemeContext);
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all orders (they contain payment info)
      const response = await apiClient.get('/orders');
      const allOrders = response.data || [];
      setOrders(allOrders);
      
      // Extract payment data from orders
      const paymentsList = allOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        user: order.customer?.firstName + ' ' + order.customer?.lastName || 'Unknown',
        customerName: order.customer?.firstName + ' ' + order.customer?.lastName || 'Unknown',
        customerEmail: order.customer?.email || 'N/A',
        customerPhone: order.customer?.phone || 'N/A',
        amount: order.total || 0,
        method: order.paymentMethod || 'CASH',
        status: order.paymentStatus || 'PENDING',
        gateway: order.paymentMethod || 'N/A',
        transactionId: order.paymentId || order.orderNumber,
        date: order.createdAt,
        merchantName: order.merchant?.businessName || 'N/A',
        deliveryFee: order.deliveryFee || 0,
        subtotal: order.subtotal || 0,
      }));
      
      setPayments(paymentsList);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payment data. Please try again.');
      showToast.error('Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentData();
  };

  const handleExport = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success('Payments exported as CSV');
  };

  const generateCSV = () => {
    let csv = 'Order Number,Customer,Amount,Method,Status,Gateway,Date,Merchant\n';
    filteredPayments.forEach(p => {
      csv += `${p.orderNumber},"${p.customerName}",${p.amount},${p.method},${p.status},${p.gateway},"${new Date(p.date).toLocaleDateString()}","${p.merchantName}"\n`;
    });
    return csv;
  };

  // Filtering
  const filteredPayments = payments.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.merchantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Statistics
  const totalRevenue = payments
    .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const failedAmount = payments
    .filter(p => p.status === 'FAILED')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const refundedAmount = payments
    .filter(p => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const failedCount = payments.filter(p => p.status === 'FAILED').length;
  const refundedCount = payments.filter(p => p.status === 'REFUNDED').length;

  // Chart data
  const methodStats = () => {
    const methods = {};
    payments.forEach(p => {
      const method = p.method || 'CASH';
      methods[method] = (methods[method] || 0) + p.amount;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };

  const statusStats = () => {
    const statuses = {};
    payments.forEach(p => {
      const status = p.status || 'PENDING';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const revenueOverTime = () => {
    const daily = {};
    payments
      .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
      .forEach(p => {
        try {
          const date = new Date(p.date).toISOString().split('T')[0];
          daily[date] = (daily[date] || 0) + p.amount;
        } catch {}
      });
    return Object.entries(daily)
      .map(([date, amount]) => ({ date: date.slice(5), amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PAID: { class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Paid' },
      COMPLETED: { class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Completed' },
      PENDING: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' },
      FAILED: { class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Failed' },
      REFUNDED: { class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: AlertCircle, label: 'Refunded' },
      PARTIALLY_REFUNDED: { class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle, label: 'Partial Refund' },
    };
    return badges[status] || badges.PENDING;
  };

  const getMethodIcon = (method) => {
    const icons = {
      CASH: '💵',
      CARD: '💳',
      MOBILE_MONEY: '📱',
      BANK_TRANSFER: '🏦',
      WALLET: '👛',
    };
    return icons[method] || '💰';
  };

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900';

  if (loading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 min-h-screen ${pageBg} flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Failed to Load Payments
          </h2>
          <p className={`${mutedText} mb-4`}>{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
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
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payments Analytics
          </h1>
          <p className={mutedText}>Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
              darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${mutedText}`}>Total Revenue</p>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">ETB {totalRevenue.toLocaleString()}</p>
          <p className={`text-xs ${mutedText} mt-1`}>{paidCount} completed</p>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${mutedText}`}>Pending</p>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">ETB {pendingAmount.toLocaleString()}</p>
          <p className={`text-xs ${mutedText} mt-1`}>{pendingCount} pending</p>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${mutedText}`}>Failed</p>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">ETB {failedAmount.toLocaleString()}</p>
          <p className={`text-xs ${mutedText} mt-1`}>{failedCount} failed</p>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${mutedText}`}>Refunded</p>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">ETB {refundedAmount.toLocaleString()}</p>
          <p className={`text-xs ${mutedText} mt-1`}>{refundedCount} refunded</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Over Time */}
        <div className={`lg:col-span-2 ${cardClass} rounded-lg shadow p-6`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Revenue Over Time
          </h3>
          {revenueOverTime().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueOverTime()}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                <XAxis dataKey="date" stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} name="Revenue (ETB)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="default" title="No revenue data" description="Revenue will appear as payments are completed." />
          )}
        </div>

        {/* Payment Methods Pie */}
        <div className={`${cardClass} rounded-lg shadow p-6`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" /> Payment Methods
          </h3>
          {methodStats().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={methodStats()} dataKey="value" nameKey="name" outerRadius={100} label>
                  {methodStats().map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: darkMode ? '#cbd5e1' : '#374151' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="default" title="No data" description="Payment methods will appear here." />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="all">All Status</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="all">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="WALLET">Wallet</option>
          </select>

          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order number, customer, or merchant..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState 
          icon="file"
          title="No payments found"
          description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Payments will appear once orders are placed.'}
        />
      ) : (
        <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Order #</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Merchant</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredPayments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={payment.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition cursor-pointer`}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <td className="py-3 px-4 font-medium text-sm">{payment.orderNumber}</td>
                      <td className="py-3 px-4 text-sm">{payment.customerName}</td>
                      <td className="py-3 px-4 text-sm">{payment.merchantName}</td>
                      <td className="py-3 px-4 font-semibold text-green-600">ETB {payment.amount?.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{getMethodIcon(payment.method)} {payment.method}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                          <StatusIcon className="w-3 h-3" /> {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${mutedText}`}>Order Number</p>
                  <p className="font-semibold">{selectedPayment.orderNumber}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPayment.status).class}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Customer</p>
                  <p className="font-semibold">{selectedPayment.customerName}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Merchant</p>
                  <p className="font-semibold">{selectedPayment.merchantName}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Amount</p>
                  <p className="font-bold text-green-600 text-lg">ETB {selectedPayment.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Method</p>
                  <p className="font-semibold">{getMethodIcon(selectedPayment.method)} {selectedPayment.method}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Subtotal</p>
                  <p className="font-semibold">ETB {selectedPayment.subtotal?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Delivery Fee</p>
                  <p className="font-semibold">ETB {selectedPayment.deliveryFee?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Transaction ID</p>
                  <p className="font-semibold text-sm">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Date</p>
                  <p className="font-semibold">{selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Customer Email</p>
                  <p className="font-semibold text-sm">{selectedPayment.customerEmail}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Customer Phone</p>
                  <p className="font-semibold text-sm">{selectedPayment.customerPhone}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;