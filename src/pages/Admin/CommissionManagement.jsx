// src/pages/admin/CommissionManagement.jsx
import { useState, useEffect } from 'react';
import { 
  DollarSign, Percent, Calculator, Save, Edit,
  TrendingUp, Users, Store, Calendar, Filter,
  Download, History, Settings, CheckCircle, XCircle
} from 'lucide-react';

const CommissionManagement = () => {
  const [activeTab, setActiveTab] = useState('rates');
  const [merchants, setMerchants] = useState([]);
  const [commissionRates, setCommissionRates] = useState({
    default: 10,
    categories: [
      { id: 1, name: 'Restaurant', rate: 15 },
      { id: 2, name: 'Food Products', rate: 12 },
      { id: 3, name: 'Electronics', rate: 8 },
      { id: 4, name: 'Fashion', rate: 10 },
      { id: 5, name: 'Services', rate: 5 }
    ],
    merchants: []
  });

  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState(null);

  // Mock data - replace with API calls
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMerchants([
        { id: 'honey_1', name: 'Pure Honey Ethiopia', category: 'Food Products', totalSales: 456789, commission: 54815, status: 'active' },
        { id: 'restaurant_1', name: 'Taste of Ethiopia', category: 'Restaurant', totalSales: 892345, commission: 133852, status: 'active' },
        { id: 'school_1', name: 'ABC International School', category: 'Services', totalSales: 125000, commission: 6250, status: 'active' },
        { id: 'stationary_1', name: 'Elite Stationary', category: 'Stationary', totalSales: 234567, commission: 23457, status: 'active' }
      ]);

      setTransactions([
        { id: 1, date: '2024-03-01', merchant: 'Pure Honey Ethiopia', amount: 45678, commission: 5481, status: 'paid' },
        { id: 2, date: '2024-03-01', merchant: 'Taste of Ethiopia', amount: 89234, commission: 13385, status: 'paid' },
        { id: 3, date: '2024-03-02', merchant: 'Elite Stationary', amount: 23456, commission: 2346, status: 'pending' },
        { id: 4, date: '2024-03-02', merchant: 'ABC School', amount: 12500, commission: 625, status: 'pending' },
        { id: 5, date: '2024-03-03', merchant: 'Pure Honey Ethiopia', amount: 34567, commission: 4150, status: 'pending' }
      ]);
      setLoading(false);
    }, 1000);
  };

  const calculateTotals = () => {
    const totalSales = merchants.reduce((sum, m) => sum + m.totalSales, 0);
    const totalCommission = merchants.reduce((sum, m) => sum + m.commission, 0);
    const pendingCommission = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.commission, 0);
    
    return { totalSales, totalCommission, pendingCommission };
  };

  const totals = calculateTotals();

  const handleSaveRate = (categoryId, newRate) => {
    setCommissionRates(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === categoryId ? { ...c, rate: newRate } : c
      )
    }));
    setEditingRate(null);
  };

  const handleProcessPayout = (transactionId) => {
    setTransactions(transactions.map(t =>
      t.id === transactionId ? { ...t, status: 'paid' } : t
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Commission Management</h1>
          <p className="text-gray-600 mt-1">Configure commission rates and track earnings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Monthly
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Active Merchants</p>
          <p className="text-2xl font-bold">{merchants.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Sales (MTD)</p>
          <p className="text-2xl font-bold">ETB {totals.totalSales.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Commission</p>
          <p className="text-2xl font-bold">ETB {totals.totalCommission.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Pending Payout</p>
          <p className="text-2xl font-bold">ETB {totals.pendingCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'rates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Commission Rates
          </button>
          <button
            onClick={() => setActiveTab('merchants')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'merchants'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Merchant Commissions
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions & Payouts
          </button>
        </div>
      </div>

      {/* Commission Rates Tab */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Commission Rate Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Set commission rates by category</p>
          </div>

          <div className="p-6">
            {/* Default Rate */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Default Commission Rate</h3>
                  <p className="text-sm text-gray-600">Applied when no category rate is set</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-blue-600">{commissionRates.default}%</span>
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Rates */}
            <h3 className="font-semibold mb-4">Category-Based Rates</h3>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Commission Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissionRates.categories.map(category => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4">
                      {editingRate === category.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            defaultValue={category.rate}
                            className="w-20 border rounded px-2 py-1"
                            min="0"
                            max="100"
                          />
                          <span>%</span>
                          <button
                            onClick={() => handleSaveRate(category.id, 10)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingRate(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium">{category.rate}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setEditingRate(category.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Commissions Tab */}
      {activeTab === 'merchants' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Merchant Commission Summary</h2>
            <p className="text-sm text-gray-500 mt-1">Monthly commission breakdown by merchant</p>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Merchant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Total Sales</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Commission Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Commission Due</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(merchant => {
                  const category = commissionRates.categories.find(c => c.name === merchant.category);
                  const rate = category?.rate || commissionRates.default;
                  
                  return (
                    <tr key={merchant.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{merchant.name}</td>
                      <td className="py-3 px-4">{merchant.category}</td>
                      <td className="py-3 px-4">ETB {merchant.totalSales.toLocaleString()}</td>
                      <td className="py-3 px-4">{rate}%</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        ETB {merchant.commission.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Commission Transactions</h2>
              <p className="text-sm text-gray-500 mt-1">Track payouts and pending commissions</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Merchant</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Order Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Commission</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4 font-medium">{transaction.merchant}</td>
                    <td className="py-3 px-4">ETB {transaction.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      ETB {transaction.commission.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handleProcessPayout(transaction.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Process Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionManagement;