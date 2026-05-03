// src/pages/AuditLogs.jsx
import { useState, useEffect, useContext } from 'react';
import {
  Search, Filter, RefreshCw, Download, Eye,
  Calendar, Clock, User, FileText, AlertCircle,
  CheckCircle, XCircle, Activity, ChevronLeft,
  ChevronRight, ChevronDown, Trash2, BarChart3,
  Users, Server, Globe, Shield, ShoppingBag,
  Store, Bike, DollarSign, Settings, LogIn,
  LogOut, UserPlus, Edit, Package
} from 'lucide-react';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const AuditLogs = () => {
  const { darkMode } = useContext(ThemeContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 50;
  
  // Filter options from API
  const [availableActions, setAvailableActions] = useState([]);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [topUsers, setTopUsers] = useState([]);
  const [hourlyActivity, setHourlyActivity] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, statusFilter, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      // Calculate date range
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        switch (dateRange) {
          case 'today': startDate.setHours(0, 0, 0, 0); break;
          case '7d': startDate.setDate(startDate.getDate() - 7); break;
          case '30d': startDate.setDate(startDate.getDate() - 30); break;
          case '90d': startDate.setDate(startDate.getDate() - 90); break;
        }
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      const response = await apiClient.get('/audit-logs', { params });
      const data = response.data;
      
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalLogs(data.pagination?.total || 0);
      setAvailableActions(data.filters?.actions || []);
      setAvailableEntities(data.filters?.entities || []);
      setAvailableStatuses(data.filters?.statuses || []);
      setStats(data.stats || { today: 0, week: 0, total: 0 });
      setTopUsers(data.topUsers || []);
      setHourlyActivity(data.hourlyActivity || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleExport = async (format) => {
    try {
      const params = { format };
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange !== 'all') {
        switch (dateRange) {
          case 'today': startDate.setHours(0, 0, 0, 0); break;
          case '7d': startDate.setDate(startDate.getDate() - 7); break;
          case '30d': startDate.setDate(startDate.getDate() - 30); break;
          case '90d': startDate.setDate(startDate.getDate() - 90); break;
        }
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      if (format === 'csv') {
        window.open(`${apiClient.defaults.baseURL}/audit-logs/export?${new URLSearchParams(params)}`, '_blank');
        showToast.success('CSV export started');
      } else {
        const response = await apiClient.get('/audit-logs/export', { params });
        const json = JSON.stringify(response.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast.success('JSON export completed');
      }
    } catch (err) {
      showToast.error('Export failed');
    }
  };

  const handleClearOldLogs = async () => {
    const days = prompt('Delete logs older than how many days?', '90');
    if (!days) return;
    if (!window.confirm(`Delete all logs older than ${days} days? This cannot be undone.`)) return;
    
    try {
      const before = new Date();
      before.setDate(before.getDate() - parseInt(days));
      const response = await apiClient.delete(`/audit-logs/clear?before=${before.toISOString()}`);
      showToast.success(`${response.data.deleted} logs deleted`);
      fetchLogs();
    } catch (err) {
      showToast.error('Failed to clear logs');
    }
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('login') || actionLower.includes('logout')) return <LogIn className="w-4 h-4 text-blue-500" />;
    if (actionLower.includes('register') || actionLower.includes('create')) return <UserPlus className="w-4 h-4 text-green-500" />;
    if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="w-4 h-4 text-yellow-500" />;
    if (actionLower.includes('delete') || actionLower.includes('remove')) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (actionLower.includes('order')) return <ShoppingBag className="w-4 h-4 text-purple-500" />;
    if (actionLower.includes('payment')) return <DollarSign className="w-4 h-4 text-emerald-500" />;
    if (actionLower.includes('merchant')) return <Store className="w-4 h-4 text-orange-500" />;
    if (actionLower.includes('product')) return <Package className="w-4 h-4 text-indigo-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badges = {
      SUCCESS: { class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      FAILED: { class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      PENDING: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      ERROR: { class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
    };
    const badge = badges[status] || { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: Activity };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="w-3 h-3" /> {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900';

  if (loading && !refreshing) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Audit Logs
          </h1>
          <p className={mutedText}>Track and monitor all system activities</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
              darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
              darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg border hidden group-hover:block z-10 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                Export CSV
              </button>
              <button onClick={() => handleExport('json')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg">
                Export JSON
              </button>
            </div>
          </div>
          <button
            onClick={handleClearOldLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear Old
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {showStats && (
        <div className="space-y-6 mb-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${cardClass} rounded-lg shadow p-4`}>
              <p className={`text-sm ${mutedText}`}>Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4`}>
              <p className={`text-sm ${mutedText}`}>This Week</p>
              <p className="text-2xl font-bold text-green-600">{stats.week}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4`}>
              <p className={`text-sm ${mutedText}`}>Total Logs</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <div className={`${cardClass} rounded-lg shadow p-4`}>
              <p className={`text-sm ${mutedText}`}>Showing</p>
              <p className="text-2xl font-bold text-orange-600">{totalLogs}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Activity */}
            <div className={`${cardClass} rounded-lg shadow p-6`}>
              <h3 className="font-semibold mb-4">Hourly Activity (Today)</h3>
              {hourlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e5e7eb"} />
                    <XAxis dataKey="hour" stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={10} />
                    <YAxis stroke={darkMode ? "#cbd5e1" : "#6b7280"} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon="default" title="No data" description="Hourly activity will appear here." />
              )}
            </div>

            {/* Top Users */}
            <div className={`${cardClass} rounded-lg shadow p-6`}>
              <h3 className="font-semibold mb-4">Most Active Users</h3>
              {topUsers.length > 0 ? (
                <div className="space-y-3">
                  {topUsers.slice(0, 8).map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name || user.username}</p>
                          <p className={`text-xs ${mutedText}`}>@{user.username}</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">{user.count} actions</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="user" title="No data" description="User activity will appear here." />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="">All Actions</option>
            {availableActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="">All Entities</option>
            {availableEntities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="">All Status</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <EmptyState 
          icon="file"
          title="No audit logs found"
          description={searchTerm || actionFilter ? 'Try adjusting your filters.' : 'Activities will appear here as users interact with the system.'}
        />
      ) : (
        <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase">IP</th>
                  <th className="text-right py-3 px-4 text-xs font-medium uppercase">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {logs.map((log) => (
                  <tr key={log.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition cursor-pointer`}
                    onClick={() => { setSelectedLog(log); setShowDetailModal(true); }}
                  >
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {log.entity && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {log.entity}
                          {log.entityId && ` #${log.entityId.slice(-6)}`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {log.user?.firstName?.charAt(0) || 'S'}
                        </div>
                        <span className="text-sm">{log.user?.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-500">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); setShowDetailModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <p className={`text-sm ${mutedText}`}>
                Page {page} of {totalPages} ({totalLogs} total logs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {getActionIcon(selectedLog.action)}
                Log Details
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${mutedText}`}>Log ID</p>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Timestamp</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Status</p>
                  {getStatusBadge(selectedLog.status)}
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Entity</p>
                  <p className="font-medium">{selectedLog.entity || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>Entity ID</p>
                  <p className="font-mono text-sm">{selectedLog.entityId || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>User</p>
                  <p className="font-medium">
                    {selectedLog.user ? `${selectedLog.user.firstName} ${selectedLog.user.lastName}` : 'System'} 
                    ({selectedLog.user?.username || 'system'})
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedText}`}>User Agent</p>
                  <p className="font-mono text-sm">{selectedLog.userAgent || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <p className={`text-xs ${mutedText} mb-2`}>Details</p>
                  <pre className={`p-4 rounded-lg text-sm font-mono overflow-x-auto ${
                    darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                      } catch {
                        return selectedLog.details;
                      }
                    })()}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => setShowDetailModal(false)}
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

export default AuditLogs;