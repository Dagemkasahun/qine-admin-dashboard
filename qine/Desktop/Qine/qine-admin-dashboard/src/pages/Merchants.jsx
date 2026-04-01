// src/pages/Merchants.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, Search, Filter, Grid, List, 
  MapPin, Plus, Phone, Mail
} from 'lucide-react';

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch merchants from API
  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/merchants');
      const data = await response.json();
      console.log('Merchants data:', data); // Debug log
      setMerchants(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      setLoading(false);
    }
  };

  // Safe filter function with null checks
  const filteredMerchants = merchants.filter(merchant => {
    // Add null checks for all fields
    const merchantType = merchant?.businessType || merchant?.type || '';
    const merchantName = merchant?.businessName || merchant?.name || '';
    const merchantCategory = merchant?.category || '';
    
    const matchesType = selectedType === 'all' || merchantType.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch = merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchantCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Safe count with null checks
  const merchantCounts = {
    all: merchants.length,
    service: merchants.filter(m => {
      const type = m?.businessType || m?.type || '';
      return type.toLowerCase() === 'service';
    }).length,
    product: merchants.filter(m => {
      const type = m?.businessType || m?.type || '';
      return type.toLowerCase() === 'product';
    }).length,
    restaurant: merchants.filter(m => {
      const type = m?.businessType || m?.type || '';
      return type.toLowerCase() === 'restaurant';
    }).length,
    promotion: merchants.filter(m => {
      const type = m?.businessType || m?.type || '';
      return type.toLowerCase() === 'promotion';
    }).length
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/400x200/3b82f6/white?text=No+Image';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchants</h1>
        <Link 
          to="/merchants/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Merchant
        </Link>
      </div>

      {/* Statistics Cards */}
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

      {/* Filters and Search Bar */}
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
              placeholder="Search merchants by name or category..."
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

      {/* Merchants Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => {
            // Safe access with defaults
            const merchantName = merchant?.businessName || merchant?.name || 'Unknown';
            const merchantType = merchant?.businessType || merchant?.type || '';
            const merchantCategory = merchant?.category || '';
            const merchantAddress = merchant?.address || '';
            const merchantPhone = merchant?.businessPhone || merchant?.phone || '';
            const merchantEmail = merchant?.businessEmail || merchant?.email || '';
            const merchantLogo = merchant?.logo || null;
            const merchantCover = merchant?.coverImage || null;
            
            return (
              <Link 
                key={merchant?.id || Math.random()}
                to={`/merchant/${merchant?.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
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
                        <img 
                          src={merchantLogo} 
                          alt={merchantName} 
                          className="w-12 h-12 object-contain"
                          onError={handleImageError}
                        />
                      ) : (
                        <Store className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-10 p-4">
                  <h3 className="font-semibold text-lg">{merchantName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{merchantCategory}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {merchant?.description || ''}
                  </p>
                  
                  {merchantAddress && (
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{merchantAddress}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {merchantType}
                    </span>
                    <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Merchant</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Category</th>
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
                
                return (
                  <tr key={merchant?.id || Math.random()} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                          {merchantLogo ? (
                            <img 
                              src={merchantLogo} 
                              alt={merchantName} 
                              className="w-8 h-8 object-contain"
                              onError={handleImageError}
                            />
                          ) : (
                            <Store className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{merchantName}</p>
                          <p className="text-xs text-gray-500">
                            {merchant?.description?.substring(0, 50) || ''}...
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {merchantType}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">{merchantCategory}</td>
                    
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {merchantPhone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {merchantPhone}
                          </div>
                        )}
                        {merchantEmail && (
                          <div className="flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-xs text-gray-500">{merchantEmail}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-4 text-sm">{merchantAddress}</td>
                    
                    <td className="py-3 px-4">
                      <Link 
                        to={`/merchant/${merchant?.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Empty State */}
          {filteredMerchants.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No merchants found matching your criteria</p>
              <button 
                onClick={() => {
                  setSelectedType('all');
                  setSearchTerm('');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Merchants;