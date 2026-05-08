// src/pages/admin/PendingApprovals.jsx - ENHANCED WITH DELETE & MORE
import { useState, useEffect, useContext } from 'react';
import { 
  Check, X, Eye, Search, Filter, Trash2,
  Store, Mail, Phone, MapPin, Calendar, FileText,
  AlertCircle, CheckCircle, Clock, Building2,
  CreditCard, User, RefreshCw, ChevronDown,
  ChevronUp, History, Shield, AlertTriangle
} from 'lucide-react';
import apiClient from '../../api/client';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toast';

const PendingApprovals = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => { fetchPendingMerchants(); }, []);

  const fetchPendingMerchants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/merchants');
      const pending = response.data.filter(m => 
        m.status === 'PENDING' || m.status === 'PENDING_APPROVAL'
      );
      
      const merchantsWithOwners = await Promise.all(
        pending.map(async (merchant) => {
          try {
            const ownerResponse = await apiClient.get(`/users/${merchant.ownerId}`);
            return { ...merchant, owner: ownerResponse.data, submittedDate: merchant.createdAt };
          } catch (error) {
            return { ...merchant, owner: { firstName: 'Unknown', lastName: '', email: '', phone: '' }, submittedDate: merchant.createdAt };
          }
        })
      );
      
      setPendingMerchants(merchantsWithOwners);
    } catch (error) {
      console.error('Error fetching pending merchants:', error);
      setPendingMerchants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); fetchPendingMerchants(); };

  // Approve merchant
  const handleApprove = async (merchantId, merchantName) => {
    if (!window.confirm(`Approve "${merchantName}"? This merchant will be able to start selling.`)) return;
    try {
      await apiClient.post(`/merchants/${merchantId}/approve`);
      setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
      showToast.success('Merchant approved successfully!');
    } catch (error) {
      try {
        await apiClient.patch(`/merchants/${merchantId}`, { status: 'ACTIVE', approvedAt: new Date().toISOString() });
        setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
        showToast.success('Merchant approved!');
      } catch (patchError) {
        showToast.error('Error approving merchant');
      }
    }
  };

  // Bulk approve all
  const handleApproveAll = async () => {
    if (pendingMerchants.length === 0) return;
    if (!window.confirm(`Approve ALL ${pendingMerchants.length} pending merchants?`)) return;
    let success = 0;
    for (const merchant of pendingMerchants) {
      try {
        await apiClient.post(`/merchants/${merchant.id}/approve`);
        success++;
      } catch { /* skip */ }
    }
    showToast.success(`${success} merchants approved!`);
    fetchPendingMerchants();
  };

  // Reject merchant
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast.warning('Please provide a reason for rejection');
      return;
    }
    try {
      await apiClient.post(`/merchants/${selectedMerchant.id}/reject`, { reason: rejectionReason });
      setPendingMerchants(prev => prev.filter(m => m.id !== selectedMerchant.id));
      setShowRejectModal(false);
      setSelectedMerchant(null);
      setRejectionReason('');
      showToast.success('Merchant rejected');
    } catch (error) {
      try {
        await apiClient.patch(`/merchants/${selectedMerchant.id}`, { status: 'REJECTED', rejectionReason });
        setPendingMerchants(prev => prev.filter(m => m.id !== selectedMerchant.id));
        setShowRejectModal(false);
        setSelectedMerchant(null);
        setRejectionReason('');
        showToast.success('Merchant rejected');
      } catch { showToast.error('Error rejecting merchant'); }
    }
  };

  // ===== NEW: Delete merchant permanently =====
  const handleDeleteMerchant = async () => {
    if (!isSuperAdmin) {
      showToast.error('Only Super Admin can permanently delete merchants');
      return;
    }

    const merchant = selectedMerchant;
    if (!window.confirm(`⚠️ PERMANENTLY DELETE "${merchant.businessName}"?\n\nThis will delete:\n- All products\n- All orders\n- All categories\n- The merchant account\n- The owner user account\n\nThis action CANNOT be undone!`)) return;

    setDeleting(true);
    try {
      // Delete the owner user (which cascades to merchant, products, orders, etc.)
      await apiClient.delete(`/users/${merchant.ownerId}`);
      setPendingMerchants(prev => prev.filter(m => m.id !== merchant.id));
      setShowDeleteModal(false);
      setSelectedMerchant(null);
      showToast.success('Merchant permanently deleted');
    } catch (error) {
      console.error('Error deleting merchant:', error);
      // Try deleting just the merchant if user deletion fails
      try {
        await apiClient.delete(`/merchants/${merchant.id}`);
        setPendingMerchants(prev => prev.filter(m => m.id !== merchant.id));
        showToast.success('Merchant deleted (owner user may need manual cleanup)');
      } catch {
        showToast.error('Error deleting merchant: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setDeleting(false);
    }
  };

  // Delete any merchant by ID (from the list directly)
  const handleQuickDelete = async (merchantId, merchantName) => {
    if (!isSuperAdmin) {
      showToast.error('Only Super Admin can delete merchants');
      return;
    }
    if (!window.confirm(`⚠️ Permanently delete "${merchantName}"?\n\nThis action cannot be undone!`)) return;
    try {
      const merchant = pendingMerchants.find(m => m.id === merchantId);
      if (merchant?.ownerId) {
        await apiClient.delete(`/users/${merchant.ownerId}`);
      } else {
        await apiClient.delete(`/merchants/${merchantId}`);
      }
      setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
      showToast.success('Merchant deleted');
    } catch (error) {
      showToast.error('Error deleting merchant');
    }
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const filteredMerchants = pendingMerchants.filter(merchant => {
    if (filter !== 'all' && merchant.businessType !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        merchant.businessName?.toLowerCase().includes(s) ||
        merchant.owner?.firstName?.toLowerCase().includes(s) ||
        merchant.owner?.lastName?.toLowerCase().includes(s) ||
        merchant.businessEmail?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const stats = {
    total: pendingMerchants.length,
    restaurant: pendingMerchants.filter(m => m.businessType === 'RESTAURANT').length,
    product: pendingMerchants.filter(m => m.businessType === 'PRODUCT').length,
    service: pendingMerchants.filter(m => m.businessType === 'SERVICE').length,
  };

  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className={`h-8 w-64 mb-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className={`h-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>)}
          </div>
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
            Merchant Approvals
          </h1>
          <p className={mutedClass}>Review, approve, reject, or delete merchant applications</p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && pendingMerchants.length > 0 && (
            <button onClick={handleApproveAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" /> Approve All ({stats.total})
            </button>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4`}><p className={`text-sm ${mutedClass}`}>Total Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.total}</p></div>
        <div className={`${cardClass} rounded-lg shadow p-4`}><p className={`text-sm ${mutedClass}`}>Restaurants</p><p className="text-2xl font-bold text-orange-600">{stats.restaurant}</p></div>
        <div className={`${cardClass} rounded-lg shadow p-4`}><p className={`text-sm ${mutedClass}`}>Product Shops</p><p className="text-2xl font-bold text-blue-600">{stats.product}</p></div>
        <div className={`${cardClass} rounded-lg shadow p-4`}><p className={`text-sm ${mutedClass}`}>Services</p><p className="text-2xl font-bold text-purple-600">{stats.service}</p></div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`border rounded-lg px-3 py-2 ${inputClass}`}>
            <option value="all">All Types</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="PRODUCT">Product</option>
            <option value="SERVICE">Service</option>
            <option value="PROMOTION">Promotion</option>
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by business name, owner, or email..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-9 pr-4 py-2 border rounded-lg ${inputClass}`} />
          </div>
        </div>
      </div>

      {/* Merchants List */}
      {filteredMerchants.length === 0 ? (
        <div className={`${cardClass} rounded-lg shadow p-12 text-center`}>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
          <p className={mutedClass}>All merchant applications have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMerchants.map((merchant) => (
            <div key={merchant.id} className={`${cardClass} rounded-lg shadow p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(merchant.id)}>
                      <h3 className="font-semibold text-lg">{merchant.businessName}</h3>
                      {expandedCard === merchant.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm">
                      <span className={`flex items-center gap-1 ${mutedClass}`}><MapPin className="w-3 h-3" /> {merchant.city}</span>
                      <span className={`flex items-center gap-1 ${mutedClass}`}><Calendar className="w-3 h-3" /> {new Date(merchant.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>{merchant.businessType}</span>
                    </div>
                    {/* Quick info */}
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div><span className={mutedClass}>Owner: </span>{merchant.owner?.firstName} {merchant.owner?.lastName}</div>
                      <div><span className={mutedClass}>Email: </span>{merchant.businessEmail || 'N/A'}</div>
                      <div><span className={mutedClass}>Phone: </span>{merchant.businessPhone || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setSelectedMerchant(merchant)}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  <button onClick={() => handleApprove(merchant.id, merchant.businessName)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => { setSelectedMerchant(merchant); setShowRejectModal(true); }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm">
                    <X className="w-4 h-4" /> Reject
                  </button>

                  {/* Delete Button - Super Admin Only */}
                  {isSuperAdmin && (
                    <button onClick={() => handleQuickDelete(merchant.id, merchant.businessName)}
                      className="px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-1 text-sm"
                      title="Permanently delete merchant and owner">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedCard === merchant.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs font-bold ${mutedClass} uppercase`}>Business Details</p>
                      <p className="text-sm">Category: {merchant.category}{merchant.subCategory ? ` - ${merchant.subCategory}` : ''}</p>
                      <p className="text-sm">Address: {merchant.address}</p>
                      <p className="text-sm">{merchant.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${mutedClass} uppercase`}>License & Tax</p>
                      <p className="text-sm">License: {merchant.licenseNumber || 'N/A'}</p>
                      <p className="text-sm">TIN: {merchant.tinNumber || 'N/A'}</p>
                      <p className="text-sm">Established: {merchant.yearEstablished || 'N/A'}</p>
                    </div>
                  </div>
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
              <h2 className="text-xl font-bold">Merchant Application Details</h2>
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

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isSuperAdmin && (
                  <button onClick={() => { setShowDeleteModal(true); setShowRejectModal(false); }}
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </button>
                )}
                <button onClick={() => setSelectedMerchant(null)}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>Close</button>
                <button onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <X className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => handleApprove(selectedMerchant.id, selectedMerchant.businessName)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Approve
                </button>
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
              <h2 className="text-xl font-bold">Reject Application</h2>
              <p className={`${mutedClass} mt-1`}>Please provide a reason for rejecting {selectedMerchant.businessName}</p>
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
                <p className="font-medium">You are about to delete:</p>
                <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
                  <li><strong>{selectedMerchant.businessName}</strong> (Merchant)</li>
                  <li>All products under this merchant</li>
                  <li>All orders associated with this merchant</li>
                  <li>The owner user account: <strong>{selectedMerchant.owner?.firstName} {selectedMerchant.owner?.lastName}</strong></li>
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