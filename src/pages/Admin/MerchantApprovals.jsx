// src/pages/admin/MerchantApprovals.jsx
import { useState, useEffect } from 'react';
import { Check, X, Eye, Download, Search, Filter } from 'lucide-react';

const MerchantApprovals = () => {
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPendingMerchants([
        {
          id: 1,
          businessName: 'ABC Restaurant',
          ownerName: 'Abebe Kebede',
          email: 'abebe@abcrestaurant.com',
          phone: '+251911223344',
          businessType: 'restaurant',
          category: 'Food & Beverage',
          address: 'Bole, Addis Ababa',
          submittedDate: '2024-03-01',
          status: 'pending',
          documents: {
            license: 'license_abc.pdf',
            ownerId: 'id_abebe.pdf'
          }
        },
        {
          id: 2,
          businessName: 'Pure Honey Ethiopia',
          ownerName: 'Sara Hailu',
          email: 'sara@purehoney.et',
          phone: '+251922334455',
          businessType: 'product',
          category: 'Food Products',
          address: 'Merkato, Addis Ababa',
          submittedDate: '2024-03-02',
          status: 'pending',
          documents: {
            license: 'license_honey.pdf',
            ownerId: 'id_sara.pdf'
          }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (merchantId) => {
    // API call to approve merchant
    console.log('Approving merchant:', merchantId);
    setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
  };

  const handleReject = (merchantId) => {
    // API call to reject merchant
    console.log('Rejecting merchant:', merchantId);
    setPendingMerchants(prev => prev.filter(m => m.id !== merchantId));
  };

  const filteredMerchants = pendingMerchants.filter(merchant => {
    if (filter === 'all') return true;
    return merchant.businessType === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchant Approvals</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search merchants..."
              className="pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="restaurant">Restaurant</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="promotion">Promotion</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingMerchants.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Approved Today</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Rejected Today</p>
          <p className="text-2xl font-bold text-red-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Merchants</p>
          <p className="text-2xl font-bold">41</p>
        </div>
      </div>

      {/* Pending Merchants List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Business</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Owner</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Contact</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Submitted</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Documents</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMerchants.map((merchant) => (
              <tr key={merchant.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-medium">{merchant.businessName}</p>
                  <p className="text-xs text-gray-500">{merchant.category}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium">{merchant.ownerName}</p>
                  <p className="text-xs text-gray-500">{merchant.email}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {merchant.businessType}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">{merchant.phone}</td>
                <td className="py-3 px-4 text-sm">{merchant.submittedDate}</td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleApprove(merchant.id)}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 mr-2"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(merchant.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approval Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Merchant Details</h2>
            {/* Merchant details here */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedMerchant(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantApprovals;