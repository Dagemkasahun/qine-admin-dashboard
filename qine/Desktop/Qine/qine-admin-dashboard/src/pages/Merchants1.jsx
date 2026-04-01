// ============================================
// FILE: src/pages/Merchants.jsx
// PURPOSE: Main merchant listing page with filters and search
// Fetches real data from the database via API
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, Search, Filter, Grid, List, 
  MapPin, Plus, Phone, Mail, RefreshCw
} from 'lucide-react';

import API_CONFIG from '../config/api';

// Replace the fetch URL with:
const Merchants = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Data states
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI states
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ========================================
  // FETCH MERCHANTS FROM API
  // ========================================
  
  const fetchMerchants = async () => {
    setLoading(true);
    setError('');
    
    try {
     // const response = await fetch('http://localhost:5001/api/merchants');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/merchants`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched merchants:', data); // Debug log
      setMerchants(data);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setError('Failed to load merchants. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load merchants on component mount
  useEffect(() => {
    fetchMerchants();
  }, []);
  
  const fetchMerchants = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/merchants');
    const data = await response.json();
    setMerchants(data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    setLoading(false);
  }
};

  // ========================================
  // FILTER MERCHANTS BASED ON SEARCH AND TYPE
  // ========================================
  
  const filteredMerchants = merchants.filter(merchant => {
    // Type filter
    const matchesType = selectedType === 'all' || merchant.type === selectedType;
    
    // Search filter (case-insensitive)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      merchant.name?.toLowerCase().includes(searchLower) ||
      merchant.category?.toLowerCase().includes(searchLower) ||
      merchant.description?.toLowerCase().includes(searchLower) ||
      merchant.address?.toLowerCase().includes(searchLower);
    
    return matchesType && matchesSearch;
  });

  // ========================================
  // MERCHANT COUNTS BY TYPE
  // ========================================
  
  const merchantCounts = {
    all: merchants.length,
    service: merchants.filter(m => m.type === 'service').length,
    product: merchants.filter(m => m.type === 'product').length,
    restaurant: merchants.filter(m => m.type === 'restaurant').length,
    promotion: merchants.filter(m => m.type === 'promotion').length
  };

  // ========================================
  // IMAGE ERROR HANDLER
  // ========================================
  
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = 'https://placehold.co/400x200/3b82f6/white?text=No+Image';
  };

  // ========================================
  // LOADING STATE
  // ========================================
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Merchants</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-4 bg-gray-200 animate-pulse w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 animate-pulse w-12"></div>
            </div>
          ))}
        </div>
        
        {/* Loading skeleton for filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="h-10 bg-gray-200 animate-pulse w-full"></div>
        </div>
        
        {/* Loading skeleton for grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-32 bg-gray-200 animate-pulse mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Store className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMerchants}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 inline-flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <div className="p-6">
      {/* ======== HEADER SECTION ======== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchants</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchMerchants}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link 
            to="/merchants/add" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Merchant
          </Link>
        </div>
      </div>

      {/* ======== STATISTICS CARDS ======== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Merchants</p>
          <p className="text-2xl font-bold">{merchantCounts.all}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Service</p>
          <p className="text-2xl font-bold text-blue-600">{merchantCounts.service}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Product</p>
          <p className="text-2xl font-bold text-green-600">{merchantCounts.product}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Restaurant</p>
          <p className="text-2xl font-bold text-orange-600">{merchantCounts.restaurant}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Promotion</p>
          <p className="text-2xl font-bold text-purple-600">{merchantCounts.promotion}</p>
        </div>
      </div>

      {/* ======== FILTERS AND SEARCH BAR ======== */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          
          <select 
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="service">Service</option>
            <option value="product">Product</option>
            <option value="restaurant">Restaurant</option>
            <option value="promotion">Promotion</option>
          </select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search merchants by name, category, or location..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition ${
                viewMode === 'list' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======== MERCHANTS DISPLAY ======== */}
      
      {/* Empty State */}
      {filteredMerchants.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No merchants found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedType !== 'all' 
              ? 'Try adjusting your filters or search term' 
              : 'Get started by adding your first merchant'}
          </p>
          {(searchTerm || selectedType !== 'all') ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          ) : (
            <Link 
              to="/merchants/add"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Merchant
            </Link>
          )}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredMerchants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => (
            <Link 
              key={merchant.id}
              to={`/merchant/${merchant.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
              {/* Cover Image Section */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                {merchant.coverImage ? (
                  <img 
                    src={merchant.coverImage} 
                    alt={merchant.name} 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
                    <Store className="w-8 h-8 opacity-50" />
                  </div>
                )}
                
                {/* Logo positioned overlapping the cover */}
                <div className="absolute -bottom-8 left-4">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center group-hover:scale-105 transition">
                    {merchant.logo ? (
                      <img 
                        src={merchant.logo} 
                        alt={merchant.name} 
                        className="w-12 h-12 object-contain"
                        onError={handleImageError}
                      />
                    ) : (
                      <Store className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Merchant Info Section */}
              <div className="pt-10 p-4">
                <h3 className="font-semibold text-lg">{merchant.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{merchant.category}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {merchant.description || 'No description provided'}
                </p>
                
                {/* Address with icon */}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{merchant.address || 'Address not provided'}</span>
                </div>
                
                {/* Footer with type badge and rating */}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {merchant.type}
                  </span>
                  {merchant.rating > 0 && (
                    <span className="text-sm text-yellow-600">
                      ★ {merchant.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && filteredMerchants.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Merchant</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="border-b hover:bg-gray-50">
                  {/* Merchant Name with Logo */}
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                        {merchant.logo ? (
                          <img 
                            src={merchant.logo} 
                            alt={merchant.name} 
                            className="w-8 h-8 object-contain"
                            onError={handleImageError}
                          />
                        ) : (
                          <Store className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{merchant.name}</p>
                        <p className="text-xs text-gray-500">
                          {merchant.description ? merchant.description.substring(0, 50) + '...' : 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Type Badge */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      merchant.type === 'service' ? 'bg-blue-100 text-blue-800' :
                      merchant.type === 'product' ? 'bg-green-100 text-green-800' :
                      merchant.type === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {merchant.type}
                    </span>
                  </td>
                  
                  {/* Category */}
                  <td className="py-3 px-4">{merchant.category || '—'}</td>
                  
                  {/* Contact Info */}
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {merchant.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {merchant.phone}
                        </div>
                      )}
                      {merchant.email && (
                        <div className="flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">{merchant.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Address */}
                  <td className="py-3 px-4 text-sm">{merchant.address || '—'}</td>
                  
                  {/* Rating */}
                  <td className="py-3 px-4">
                    {merchant.rating > 0 ? (
                      <span className="text-yellow-600">★ {merchant.rating.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  
                  {/* Action Link */}
                  <td className="py-3 px-4">
                    <Link 
                      to={`/merchant/${merchant.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Merchants;