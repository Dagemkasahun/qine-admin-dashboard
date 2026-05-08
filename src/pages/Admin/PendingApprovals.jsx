// src/pages/admin/PendingApprovals.jsx - COMBINED APPROVAL + MERCHANT MANAGEMENT
import { useState, useEffect, useContext } from 'react';
import { 
  Check, X, Eye, Search, Filter, Trash2,
  Store, Mail, Phone, MapPin, Calendar, FileText,
  AlertCircle, CheckCircle, Clock, Building2,
  CreditCard, User, RefreshCw, ChevronDown,
  ChevronUp, History, Shield, AlertTriangle,
  Ban, UserCheck, Star, Package, DollarSign,
  BarChart3, Activity
} from 'lucide-react';
import apiClient from '../../api/client';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';

const PendingApprovals = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => { fetchAllMerchants(); }, [statusFilter]);

  const fetchAllMerchants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/merchants');
      let allMerchants = response.data || [];
      
      // Filter by status if needed
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending') {
          allMerchants = allMerchants.filter(m => ['PENDING', 'PENDING_APPROVAL'].includes(m.status));
        } else {
          allMerchants = allMerchants.filter(m => m.status === statusFilter);
        }
      }
      
      // Fetch owner details for merchants without them
      const merchantsWithOwners = await Promise.all(
        allMerchants.map(async (merchant) => {
          if (merchant.owner) return merchant;
          try {
            const ownerResponse = await apiClient.get(`/users/${merchant.ownerId}`);
            return { ...merchant, owner: ownerResponse.data, submittedDate: merchant.createdAt };
          } catch (error) {
            return { ...merchant, owner: { firstName: 'Unknown', lastName: '', email: '', phone: '' }, submittedDate: merchant.createdAt };
          }
        })
      );
      
      setMerchants(merchantsWithOwners);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      setMerchants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchAllMerchants(); };

  // ===== APPROVE =====
  const handleApprove = async (merchantId, merchantName) => {
    if (!window.confirm(`Approve "${merchantName}"?`)) return;
    try {
      await apiClient.post(`/merchants/${merchantId}/approve`);
      setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, status: 'ACTIVE' } : m));
      showToast.success(`${merchantName} approved!`);
    } catch (error) {
      try {
        await apiClient.patch(`/merchants/${merchantId}`, { status: 'ACTIVE' });
        setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, status: 'ACTIVE' } : m));
        showToast.success('Approved!');
      } catch { showToast.error('Error approving'); }
    }
  };

  // ===== APPROVE ALL PENDING =====
  const handleApproveAll = async () => {
    const pending = merchants.filter(m => ['PENDING', 'PENDING_APPROVAL'].includes(m.status));
    if (pending.length === 0) { showToast.info('No pending merchants'); return; }
    if (!window.confirm(`Approve ALL ${pending.length} pending merchants?`)) return;
    let success = 0;
    for (const m of pending) {
      try { await apiClient.post(`/merchants/${m.id}/approve`); success++; } catch {}
    }
    showToast.success(`${success} approved!`);
    fetchAllMerchants();
  };

  // ===== REJECT =====
  const openRejectModal = (merchant) => {
    setSelectedMerchant(merchant);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { showToast.warning('Provide a reason'); return; }
    try {
      await apiClient.post(`/merchants/${selectedMerchant.id}/reject`, { reason: rejectionReason });
      setMerchants(prev => prev.map(m => m.id === selectedMerchant.id ? { ...m, status: 'REJECTED' } : m));
      setShowRejectModal(false); setSelectedMerchant(null); setRejectionReason('');
      showToast.success('Rejected');
    } catch { showToast.error('Error rejecting'); }
  };

  // ===== SUSPEND / ACTIVATE =====
  const handleToggleStatus = async (merchant) => {
    const newStatus = merchant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'suspend';
    if (!window.confirm(`${action} "${merchant.businessName}"?`)) return;
    try {
      await apiClient.patch(`/merchants/${merchant.id}`, { status: newStatus });
      setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, status: newStatus } : m));
      showToast.success(`Merchant ${action}d`);
    } catch { showToast.error(`Error ${action}ing`); }
  };

  // ===== DELETE =====
  const openDeleteModal = (merchant) => {
    if (!isSuperAdmin) { showToast.error('Only Super Admin can delete merchants'); return; }
    setSelectedMerchant(merchant);
    setShowDeleteModal(true);
  };

  const handleDeleteMerchant = async () => {
    if (!isSuperAdmin) return;
    const merchant = selectedMerchant;
    if (!window.confirm(`⚠️ PERMANENTLY DELETE "${merchant.businessName}"?\n\nThis will delete:\n- All products & orders\n- The owner user account\n\nThis CANNOT be undone!`)) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/users/${merchant.ownerId}`);
      setMerchants(prev => prev.filter(m => m.id !== merchant.id));
      setShowDeleteModal(false); setSelectedMerchant(null);
      showToast.success('Deleted permanently');
    } catch (error) {
      try {
        await apiClient.delete(`/merchants/${merchant.id}`);
        setMerchants(prev => prev.filter(m => m.id !== merchant.id));
        showToast.success('Merchant deleted (owner may need manual cleanup)');
      } catch { showToast.error('Error: ' + (error.response?.data?.error || error.message)); }
    } finally {
      setDeleting(false);
    }
  };

  const toggleExpand = (id) => setExpandedCard(expandedCard === id ? null : id);

  const filteredMerchants = merchants.filter(merchant => {
    if (filter !== 'all' && merchant.businessType !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        merchant.businessName?.toLowerCase().includes(s) ||
        merchant.owner?.firstName?.toLowerCase().includes(s) ||
        merchant.owner?.lastName?.toLowerCase().includes(s) ||
        merchant.businessEmail?.toLowerCase().includes(s) ||
        merchant.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const stats = {
    total: merchants.length,
    pending: merchants.filter(m => ['PENDING', 'PENDING_APPROVAL'].includes(m.status)).length,
    active: merchants.filter(m => m.status === 'ACTIVE').length,
    suspended: merchants.filter(m => m.status === 'SUSPENDED').length,
    rejected: merchants.filter(m => m.status === 'REJECTED').length,
    restaurant: merchants.filter(m => m.businessType === 'RESTAURANT').length,
    product: merchants.filter(m => m.businessType === 'PRODUCT').length,
    service: merchants.filter(m => m.businessType === 'SERVICE').length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      REJECTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    };
    return badges[status] || badges.PENDING;
  };

  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className={`h-8 w-64 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-7 gap-4">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className={`h-16 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>)}
          </div>
          <div className={`h-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isSuperAdmin && <Shield className="inline w-6 h-6 mr-2 text-yellow-500" />}
            Merchant Management
          </h1>
          <p className={mutedClass}>
            {isSuperAdmin ? 'Full control: Approve, reject, suspend, or delete merchants' : 'Review and manage merchant applications'}
          </p>
        </div>
        <div className="flex gap-2">
          {stats.pending > 0 && (
            <button onClick={handleApproveAll} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" /> Approve All ({stats.pending})
            </button>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-3 text-center`}>
          <p className={`text-xs ${mutedClass}`}>Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center border-l-4 border-yellow-500`}>
          <p className={`text-xs ${mutedClass}`}>Pending</p>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center border-l-4 border-green-500`}>
          <p className={`text-xs ${mutedClass}`}>Active</p>
          <p className="text-xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center border-l-4 border-red-500`}>
          <p className={`text-xs ${mutedClass}`}>Suspended</p>
          <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center border-l-4 border-gray-500`}>
          <p className={`text-xs ${mutedClass}`}>Rejected</p>
          <p className="text-xl font-bold text-gray-600">{stats.rejected}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center`}>
          <p className={`text-xs ${mutedClass}`}>Restaurants</p>
          <p className="text-xl font-bold text-orange-600">{stats.restaurant}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 text-center`}>
          <p className={`text-xs ${mutedClass}`}>Products</p>
          <p className="text-xl font-bold text-blue-600">{stats.product}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}>
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}>
            <option value="all">All Types</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="PRODUCT">Product</option>
            <option value="SERVICE">Service</option>
            <option value="PROMOTION">Promotion</option>
          </select>

          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by name, email, category..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${inputClass}`} />
          </div>
        </div>
      </div>

      {/* Merchants List */}
      {filteredMerchants.length === 0 ? (
        <div className={`${cardClass} rounded-lg shadow p-12 text-center`}>
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Merchants Found</h3>
          <p className={mutedClass}>{searchTerm ? 'Try adjusting your filters.' : 'All caught up!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMerchants.map((merchant) => (
            <div key={merchant.id} className={`${cardClass} rounded-lg shadow p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(merchant.id)}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{merchant.businessName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(merchant.status)}`}>
                        {merchant.status?.replace(/_/g, ' ')}
                      </span>
                      {expandedCard === merchant.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs">
                      <span className={mutedClass}>{merchant.category}</span>
                      <span className={mutedClass}>•</span>
                      <span className={mutedClass}>{merchant.city || 'N/A'}</span>
                      {merchant.rating > 0 && <><span className={mutedClass}>•</span><span className="text-yellow-600">⭐ {merchant.rating?.toFixed(1)}</span></>}
                      <span className={mutedClass}>•</span>
                      <span className={mutedClass}>{merchant.totalOrders || 0} orders</span>
                    </div>
                    {/* Owner info */}
                    <div className="text-xs mt-1">
                      <span className={mutedClass}>Owner: </span>
                      {merchant.owner?.firstName} {merchant.owner?.lastName}
                      <span className="mx-2">|</span>
                      <Mail className="w-3 h-3 inline" /> {merchant.businessEmail || merchant.owner?.email || 'N/A'}
                      <span className="mx-2">|</span>
                      <Phone className="w-3 h-3 inline" /> {merchant.businessPhone || merchant.owner?.phone || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* View Details */}
                  <button onClick={() => setSelectedMerchant(merchant)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <Eye className="w-3 h-3" /> View
                  </button>

                  {/* Approve (for pending) */}
                  {['PENDING', 'PENDING_APPROVAL'].includes(merchant.status) && (
                    <button onClick={() => handleApprove(merchant.id, merchant.businessName)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                  )}

                  {/* Reject (for pending) */}
                  {['PENDING', 'PENDING_APPROVAL'].includes(merchant.status) && (
                    <button onClick={() => openRejectModal(merchant)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium flex items-center gap-1">
                      <X className="w-3 h-3" /> Reject
                    </button>
                  )}

                  {/* Suspend/Activate (for active/suspended) */}
                  {['ACTIVE', 'SUSPENDED'].includes(merchant.status) && (
                    <button onClick={() => handleToggleStatus(merchant)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                        merchant.status === 'ACTIVE' 
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}>
                      {merchant.status === 'ACTIVE' ? <><Ban className="w-3 h-3" /> Suspend</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                    </button>
                  )}

                  {/* Delete (Super Admin only) */}
                  {isSuperAdmin && (
                    <button onClick={() => openDeleteModal(merchant)}
                      className="px-3 py-1.5 bg-red-700 text-white rounded-lg hover:bg-red-800 text-xs font-medium flex items-center gap-1"
                      title="Permanently delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedCard === merchant.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><span className={`font-bold ${mutedClass}`}>Type:</span> {merchant.businessType}</div>
                  <div><span className={`font-bold ${mutedClass}`}>Category:</span> {merchant.category}</div>
                  <div><span className={`font-bold ${mutedClass}`}>Address:</span> {merchant.address}</div>
                  <div><span className={`font-bold ${mutedClass}`}>Joined:</span> {new Date(merchant.createdAt).toLocaleDateString()}</div>
                  <div><span className={`font-bold ${mutedClass}`}>License:</span> {merchant.licenseNumber || 'N/A'}</div>
                  <div><span className={`font-bold ${mutedClass}`}>TIN:</span> {merchant.tinNumber || 'N/A'}</div>
                  <div><span className={`font-bold ${mutedClass}`}>Total Orders:</span> {merchant.totalOrders || 0}</div>
                  <div><span className={`font-bold ${mutedClass}`}>Revenue:</span> ETB {merchant.totalRevenue?.toLocaleString() || 0}</div>
                  {merchant.description && (
                    <div className="col-span-full"><span className={`font-bold ${mutedClass}`}>Description:</span> {merchant.description}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {selectedMerchant && !showRejectModal && !showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-bold">
                {selectedMerchant.businessName}
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${getStatusBadge(selectedMerchant.status)}`}>
                  {selectedMerchant.status?.replace(/_/g, ' ')}
                </span>
              </h2>
              <button onClick={() => setSelectedMerchant(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> Business Information</h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div><p className={`text-sm ${mutedClass}`}>Business Name</p><p className="font-medium">{selectedMerchant.businessName}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>Business Type</p><p className="font-medium">{selectedMerchant.businessType}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>Category</p><p className="font-medium">{selectedMerchant.category}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>Website</p><p className="font-medium">{selectedMerchant.website || 'N/A'}</p></div>
                  <div className="col-span-2"><p className={`text-sm ${mutedClass}`}>Address</p><p className="font-medium">{selectedMerchant.address}</p></div>
                  <div className="col-span-2"><p className={`text-sm ${mutedClass}`}>Description</p><p className="text-sm">{selectedMerchant.description || 'No description'}</p></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> License & Tax</h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div><p className={`text-sm ${mutedClass}`}>License</p><p className="font-medium">{selectedMerchant.licenseNumber || 'N/A'}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>TIN</p><p className="font-medium">{selectedMerchant.tinNumber || 'N/A'}</p></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Owner Information</h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div><p className={`text-sm ${mutedClass}`}>Name</p><p className="font-medium">{selectedMerchant.owner?.firstName} {selectedMerchant.owner?.lastName}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>Email</p><p className="font-medium">{selectedMerchant.owner?.email}</p></div>
                  <div><p className={`text-sm ${mutedClass}`}>Phone</p><p className="font-medium">{selectedMerchant.owner?.phone}</p></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isSuperAdmin && (
                  <button onClick={() => openDeleteModal(selectedMerchant)}
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </button>
                )}
                <button onClick={() => setSelectedMerchant(null)}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Close</button>
                {['PENDING', 'PENDING_APPROVAL'].includes(selectedMerchant.status) && (
                  <>
                    <button onClick={() => { setSelectedMerchant(null); openRejectModal(selectedMerchant); }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                    <button onClick={() => { handleApprove(selectedMerchant.id, selectedMerchant.businessName); setSelectedMerchant(null); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold">Reject: {selectedMerchant.businessName}</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                rows="4" className={`w-full border rounded-lg px-4 py-2 ${inputClass}`}
                placeholder="Explain why this application is being rejected..." />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
                <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-red-800' : 'border-red-200'} ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" /> Permanent Deletion
              </h2>
              <p className="text-sm mt-1">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
                <p className="font-medium">You are about to permanently delete:</p>
                <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                  <li><strong>{selectedMerchant.businessName}</strong></li>
                  <li>All products under this merchant</li>
                  <li>All orders associated with this merchant</li>
                  <li>The owner user account</li>
                </ul>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); }}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Cancel</button>
                <button onClick={handleDeleteMerchant} disabled={deleting}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;