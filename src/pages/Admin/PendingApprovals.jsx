// src/pages/admin/PendingApprovals.jsx
import { useState, useEffect, useContext } from 'react';
import { 
  Check, X, Eye, Download, Search, Filter,
  Store, Mail, Phone, MapPin, Calendar, FileText,
  AlertCircle, CheckCircle, Clock, Building2,
  CreditCard, User, RefreshCw
} from 'lucide-react';
import apiClient from '../../api/client';  // 
import { ThemeContext } from '../../context/ThemeContext';  

const PendingApprovals = () => {
  const { darkMode } = useContext(ThemeContext);
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingMerchants();
  }, []);

  const fetchPendingMerchants = async () => {
    setLoading(true);
    try {
      // Fetch merchants with status PENDING
      const response = await apiClient.get('/merchants');
      
      // Filter for pending merchants only
      const pending = response.data.filter(m => 
        m.status === 'PENDING' || m.status === 'PENDING_APPROVAL'
      );
      
      // Fetch owner details for each merchant
      const merchantsWithOwners = await Promise.all(
        pending.map(async (merchant) => {
          try {
            const ownerResponse = await apiClient.get(`/users/${merchant.ownerId}`);
            return {
              ...merchant,
              owner: ownerResponse.data,
              submittedDate: merchant.createdAt,
            };
          } catch (error) {
            console.error(`Error fetching owner for merchant ${merchant.id}:`, error);
            return {
              ...merchant,
              owner: { firstName: 'Unknown', lastName: '', email: '', phone: '' },
              submittedDate: merchant.createdAt,
            };
          }
        })
      );
      
      setPendingMerchants(merchantsWithOwners);
    } catch (error) {
      console.error('Error fetching pending merchants:', error);
      // Fallback to mock data only if API fails
      setPendingMerchants(getMockPendingMerchants());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data fallback (only used if API fails)
  const getMockPendingMerchants = () => [
    {
      id: 'mock-1',
      businessName: 'ABC Restaurant',
      businessType: 'RESTAURANT',
      category: 'Restaurant',
      subCategory: 'Ethiopian Cuisine',
      description: 'Authentic Ethiopian cuisine',
      address: 'Bole, Addis Ababa',
      city: 'Addis Ababa',
      businessPhone: '+251911223344',
      businessEmail: 'info@abcrestaurant.com',
      licenseNumber: 'LIC-123',
      tinNumber: 'TIN-456',
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      owner: {
        firstName: 'Abebe',
        lastName: 'Kebede',
        email: 'abebe@example.com',
        phone: '+251911223344'
      }
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingMerchants();
  };

  const handleApprove = async (merchantId) => {
    if (!window.confirm('Are you sure you want to approve this merchant?')) {
      return;
    }

    try {
      // Update merchant status to ACTIVE
      await apiClient.patch(`/merchants/${merchantId}`, {
        status: 'ACTIVE',
        approvedAt: new Date().toISOString(),
      });
      
      // Remove from pending list
      setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
      
      // Show success message
      alert('✅ Merchant approved successfully! The merchant can now log in and start selling.');
      
    } catch (error) {
      console.error('Error approving merchant:', error);
      alert('❌ Error approving merchant: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      // Update merchant status to REJECTED with reason
      await apiClient.patch(`/merchants/${selectedMerchant.id}`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason,
      });
      
      // Remove from pending list
      setPendingMerchants(prev => prev.filter(m => m.id !== selectedMerchant.id));
      setShowRejectModal(false);
      setSelectedMerchant(null);
      setRejectionReason('');
      
      alert('Merchant application rejected.');
      
    } catch (error) {
      console.error('Error rejecting merchant:', error);
      alert('❌ Error rejecting merchant: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredMerchants = pendingMerchants.filter(merchant => {
    if (filter !== 'all' && merchant.businessType !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        merchant.businessName?.toLowerCase().includes(searchLower) ||
        merchant.owner?.firstName?.toLowerCase().includes(searchLower) ||
        merchant.owner?.lastName?.toLowerCase().includes(searchLower) ||
        merchant.businessEmail?.toLowerCase().includes(searchLower)
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

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 w-64 mb-6 rounded"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Merchant Approvals
          </h1>
          <p className={`${mutedClass} mt-1`}>
            Review and approve new merchant applications
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
            darkMode 
              ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Total Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.total}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Restaurants</p>
          <p className="text-2xl font-bold text-orange-600">{stats.restaurant}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Product Shops</p>
          <p className="text-2xl font-bold text-blue-600">{stats.product}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedClass}`}>Services</p>
          <p className="text-2xl font-bold text-purple-600">{stats.service}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Types</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="PRODUCT">Product</option>
            <option value="SERVICE">Service</option>
            <option value="PROMOTION">Promotion</option>
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by business name, owner, or email..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{merchant.businessName}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm">
                      <span className={`flex items-center gap-1 ${mutedClass}`}>
                        <MapPin className="w-3 h-3" /> {merchant.city}
                      </span>
                      <span className={`flex items-center gap-1 ${mutedClass}`}>
                        <Calendar className="w-3 h-3" /> 
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        darkMode 
                          ? 'bg-purple-900/30 text-purple-300' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {merchant.businessType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMerchant(merchant)}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => handleApprove(merchant.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      setShowRejectModal(true);
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              {/* Quick Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className={`text-xs ${mutedClass}`}>Owner</p>
                  <p className="font-medium">
                    {merchant.owner?.firstName} {merchant.owner?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{merchant.owner?.email}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedClass}`}>Contact</p>
                  <p className="font-medium">{merchant.businessPhone}</p>
                  <p className="text-sm text-gray-500">{merchant.businessEmail}</p>
                </div>
                <div>
                  <p className={`text-xs ${mutedClass}`}>Category</p>
                  <p className="font-medium">{merchant.category}</p>
                  {merchant.subCategory && (
                    <p className="text-sm text-gray-500">{merchant.subCategory}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merchant Details Modal */}
      {selectedMerchant && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Merchant Application Details</h2>
              <button 
                onClick={() => setSelectedMerchant(null)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Business Information
                </h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Business Name</p>
                    <p className="font-medium">{selectedMerchant.businessName}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Business Type</p>
                    <p className="font-medium">{selectedMerchant.businessType}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Category</p>
                    <p className="font-medium">{selectedMerchant.category}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Established</p>
                    <p className="font-medium">{selectedMerchant.yearEstablished || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm ${mutedClass}`}>Address</p>
                    <p className="font-medium">{selectedMerchant.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-sm ${mutedClass}`}>Description</p>
                    <p className="text-sm">{selectedMerchant.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* License & Tax Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> License & Tax Information
                </h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>License Number</p>
                    <p className="font-medium">{selectedMerchant.licenseNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>TIN Number</p>
                    <p className="font-medium">{selectedMerchant.tinNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> Owner Information
                </h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Full Name</p>
                    <p className="font-medium">
                      {selectedMerchant.owner?.firstName} {selectedMerchant.owner?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Email</p>
                    <p className="font-medium">{selectedMerchant.owner?.email}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${mutedClass}`}>Phone</p>
                    <p className="font-medium">{selectedMerchant.owner?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedMerchant(null)}
                  className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleApprove(selectedMerchant.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Merchant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Reject Application</h2>
              <p className={`${mutedClass} mt-1`}>
                Please provide a reason for rejecting {selectedMerchant.businessName}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                className={`w-full border rounded-lg px-4 py-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Explain why this application is being rejected..."
              />
              <p className={`text-sm ${mutedClass} mt-2`}>
                This reason will be saved and can be viewed by the merchant.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className={`px-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
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