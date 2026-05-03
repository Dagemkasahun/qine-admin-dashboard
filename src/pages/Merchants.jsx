// src/pages/Merchants.jsx - ENHANCED WITH BULK ACTIONS & COMPARISON
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Store, Search, Filter, Grid, List, 
  MapPin, Plus, Phone, Mail, Star,
  Download, CheckCircle, XCircle, Ban,
  CheckSquare, Square, ChevronDown,
  RefreshCw, TrendingUp, TrendingDown,
  Eye, Edit, Trash2, AlertCircle,
  BarChart3, Users, DollarSign
} from 'lucide-react';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';

const Merchants = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMerchants, setSelectedMerchants] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareMerchants, setCompareMerchants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/merchants?include=basic');
      const data = response.data || [];
      setMerchants(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        active: data.filter(m => m.status === 'ACTIVE').length,
        pending: data.filter(m => ['PENDING', 'PENDING_APPROVAL'].includes(m.status)).length,
        suspended: data.filter(m => m.status === 'SUSPENDED').length,
      });
    } catch (error) {
      console.error('Error fetching merchants:', error);
      showToast.error('Failed to load merchants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMerchants();
  };

  // Selection handlers
  const toggleSelectAll = () => {
    const filtered = getFilteredMerchants();
    if (selectedMerchants.size === filtered.length) {
      setSelectedMerchants(new Set());
    } else {
      setSelectedMerchants(new Set(filtered.map(m => m.id)));
    }
  };

  const toggleSelectMerchant = (id) => {
    const newSelected = new Set(selectedMerchants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMerchants(newSelected);
  };

  const clearSelection = () => {
    setSelectedMerchants(new Set());
    setShowBulkActions(false);
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedMerchants.size === 0) return;
    if (!window.confirm(`Approve ${selectedMerchants.size} selected merchant(s)?`)) return;
    
    const ids = Array.from(selectedMerchants);
    let success = 0;
    
    for (const id of ids) {
      try {
        await apiClient.post(`/merchants/${id}/approve`);
        success++;
      } catch (error) {
        console.error(`Error approving ${id}:`, error);
      }
    }
    
    showToast.success(`${success} merchant(s) approved`);
    clearSelection();
    fetchMerchants();
  };

  const handleBulkReject = async () => {
    if (selectedMerchants.size === 0) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    const ids = Array.from(selectedMerchants);
    let success = 0;
    
    for (const id of ids) {
      try {
        await apiClient.post(`/merchants/${id}/reject`, { reason });
        success++;
      } catch (error) {
        console.error(`Error rejecting ${id}:`, error);
      }
    }
    
    showToast.success(`${success} merchant(s) rejected`);
    clearSelection();
    fetchMerchants();
  };

  const handleBulkSuspend = async () => {
    if (selectedMerchants.size === 0) return;
    if (!window.confirm(`Suspend ${selectedMerchants.size} selected merchant(s)?`)) return;
    
    const ids = Array.from(selectedMerchants);
    let success = 0;
    
    for (const id of ids) {
      try {
        await apiClient.patch(`/merchants/${id}`, { status: 'SUSPENDED' });
        success++;
      } catch (error) {
        console.error(`Error suspending ${id}:`, error);
      }
    }
    
    showToast.success(`${success} merchant(s) suspended`);
    clearSelection();
    fetchMerchants();
  };

  // Compare merchants
  const handleCompare = () => {
    const selected = Array.from(selectedMerchants);
    if (selected.length < 2) {
      showToast.warning('Select at least 2 merchants to compare');
      return;
    }
    if (selected.length > 4) {
      showToast.warning('Maximum 4 merchants for comparison');
      return;
    }
    const toCompare = merchants.filter(m => selected.includes(m.id));
    setCompareMerchants(toCompare);
    setShowCompareModal(true);
  };

  const getFilteredMerchants = () => {
    return merchants.filter(merchant => {
      const merchantType = merchant?.businessType || merchant?.type || '';
      const merchantName = merchant?.businessName || merchant?.name || '';
      const merchantCategory = merchant?.category || '';
      
      const matchesType = selectedType === 'all' || merchantType.toLowerCase() === selectedType.toLowerCase();
      const matchesSearch = merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           merchantCategory.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/400x200/3b82f6/white?text=No+Image';
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
      PENDING: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
      PENDING_APPROVAL: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
      SUSPENDED: { class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Suspended' },
      REJECTED: { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', label: 'Rejected' },
      INACTIVE: { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', label: 'Inactive' },
    };
    return badges[status] || badges.PENDING;
  };

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const filteredMerchants = getFilteredMerchants();
  const selectedCount = selectedMerchants.size;

  if (loading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Merchants
          </h1>
          <p className={mutedClass}>Manage and monitor all merchant accounts</p>
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
          <Link 
            to="/merchants/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Merchant
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${mutedClass}`}>Total Merchants</p>
            <Store className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${mutedClass}`}>Active</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${mutedClass}`}>Pending Approval</p>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 hover:shadow-md transition`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${mutedClass}`}>Suspended</p>
            <Ban className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between flex-wrap gap-3 ${
          darkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{selectedCount} merchant(s) selected</span>
            <button onClick={clearSelection} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCompare}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm transition"
            >
              <BarChart3 className="w-4 h-4" /> Compare
            </button>
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm transition"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm transition"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={handleBulkSuspend}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-1 text-sm transition"
            >
              <Ban className="w-4 h-4" /> Suspend
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          
          <select 
            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${inputClass}`}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="service">Service</option>
            <option value="product">Product</option>
            <option value="restaurant">Restaurant</option>
            <option value="promotion">Promotion</option>
          </select>

          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search merchants by name or category..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Merchants Display */}
      {filteredMerchants.length === 0 ? (
        <EmptyState 
          icon="user"
          title="No merchants found"
          description={searchTerm ? 'Try adjusting your search or filters.' : 'Add your first merchant to get started.'}
          action={!searchTerm ? () => navigate('/merchants/add') : null}
          actionLabel="Add New Merchant"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => {
            const merchantName = merchant?.businessName || merchant?.name || 'Unknown';
            const merchantType = merchant?.businessType || merchant?.type || '';
            const merchantCategory = merchant?.category || '';
            const merchantAddress = merchant?.address || '';
            const merchantLogo = merchant?.logo || null;
            const merchantCover = merchant?.coverImage || null;
            const statusBadge = getStatusBadge(merchant.status);
            const isSelected = selectedMerchants.has(merchant.id);
            
            return (
              <div 
                key={merchant?.id || Math.random()}
                className={`relative ${cardClass} rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden group ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSelectMerchant(merchant.id);
                  }}
                  className={`absolute top-3 left-3 z-10 w-6 h-6 rounded flex items-center justify-center transition ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-400 hover:bg-white'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>

                <Link to={`/merchant/${merchant?.id}`}>
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {merchantCover ? (
                      <img 
                        src={merchantCover} 
                        alt={merchantName} 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {merchantName.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-8 left-4">
                      <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center group-hover:scale-105 transition">
                        {merchantLogo ? (
                          <img src={merchantLogo} alt={merchantName} className="w-12 h-12 object-contain" onError={handleImageError} />
                        ) : (
                          <Store className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  
                  <div className="pt-10 p-4">
                    <h3 className="font-semibold text-lg truncate">{merchantName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{merchantCategory}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {merchant?.description || 'No description'}
                    </p>
                    
                    {merchantAddress && (
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{merchantAddress}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {merchantType}
                        </span>
                        {merchant.rating > 0 && (
                          <span className="flex items-center text-xs text-yellow-600">
                            <Star className="w-3 h-3 mr-0.5" /> {merchant.rating?.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${cardClass} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b`}>
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                      {selectedMerchants.size === filteredMerchants.length && filteredMerchants.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Merchant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredMerchants.map((merchant) => {
                  const merchantName = merchant?.businessName || merchant?.name || 'Unknown';
                  const merchantType = merchant?.businessType || merchant?.type || '';
                  const merchantCategory = merchant?.category || '';
                  const merchantPhone = merchant?.businessPhone || merchant?.phone || '';
                  const merchantEmail = merchant?.businessEmail || merchant?.email || '';
                  const merchantAddress = merchant?.address || '';
                  const merchantLogo = merchant?.logo || null;
                  const statusBadge = getStatusBadge(merchant.status);
                  const isSelected = selectedMerchants.has(merchant.id);
                  
                  return (
                    <tr key={merchant?.id || Math.random()} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectMerchant(merchant.id)} className="p-1 rounded">
                          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                            {merchantLogo ? (
                              <img src={merchantLogo} alt={merchantName} className="w-8 h-8 object-contain" onError={handleImageError} />
                            ) : (
                              <Store className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{merchantName}</p>
                            <p className="text-xs text-gray-500">{merchant?.description?.substring(0, 50) || ''}...</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs">
                          {merchantType}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-sm">{merchantCategory}</td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="text-sm space-y-1">
                          {merchantPhone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {merchantPhone}
                            </div>
                          )}
                          {merchantEmail && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-xs text-gray-500">{merchantEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-sm">{merchantAddress}</td>
                      
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Link 
                            to={`/merchant/${merchant?.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && compareMerchants.length >= 2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 z-10 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Merchant Comparison</h2>
              <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="py-3 px-4 text-left">Metric</th>
                      {compareMerchants.map(m => (
                        <th key={m.id} className="py-3 px-4 text-center font-bold">
                          {m.businessName || m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Status</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(m.status).class}`}>
                            {getStatusBadge(m.status).label}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Category</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center">{m.category || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Rating</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {m.rating?.toFixed(1) || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Total Orders</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center">{m.totalOrders || 0}</td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Total Revenue</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center font-bold text-green-600">
                          ETB {(m.totalRevenue || 0).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Products</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center">{m.products?.length || 0}</td>
                      ))}
                    </tr>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="py-3 px-4 font-medium">Address</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center text-sm">{m.address || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Joined</td>
                      {compareMerchants.map(m => (
                        <td key={m.id} className="py-3 px-4 text-center text-sm">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowCompareModal(false)}
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

export default Merchants;