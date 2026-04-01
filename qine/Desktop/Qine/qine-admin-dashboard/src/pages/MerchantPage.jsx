// src/pages/MerchantPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Store, Phone, Mail, MapPin, ArrowLeft,
  Clock, Calendar, Truck, Users, Package, 
  Utensils, Star, Edit, Globe, Award
} from 'lucide-react';
import { api } from '../services/api';

const MerchantPage = () => {
  const { merchantId } = useParams();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMerchant();
  }, [merchantId]);

  const fetchMerchant = async () => {
    try {
      setLoading(true);
      console.log('Fetching merchant with ID:', merchantId);
      const data = await api.merchants.getById(merchantId);
      console.log('Merchant data:', data);
      setMerchant(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching merchant:', err);
      setError('Failed to load merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/400x200/3b82f6/white?text=No+Image';
  };

  // Parse JSON fields
  const parseJsonField = (field) => {
    if (!field) return null;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return field;
    }
  };

  const configuration = parseJsonField(merchant?.configuration);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 w-full mb-2"></div>
          <div className="h-4 bg-gray-200 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="p-6 text-center">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Merchant Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "The merchant you're looking for doesn't exist."}</p>
        <Link 
          to="/merchants" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Merchants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link 
            to="/merchants" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Merchants
          </Link>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              merchant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              merchant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {merchant.status || 'PENDING'}
            </span>
            <button className="text-gray-500 hover:text-gray-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Merchant Header with Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {merchant.coverImage ? (
          <img 
            src={merchant.coverImage} 
            alt={merchant.businessName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-20">
            {merchant.businessName?.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Logo and Business Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end">
              {/* Logo */}
              <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center mr-6 overflow-hidden border-4 border-white">
                {merchant.logo ? (
                  <img 
                    src={merchant.logo} 
                    alt={merchant.businessName} 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <Store className="w-12 h-12 text-blue-600" />
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{merchant.businessName}</h1>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {merchant.businessType}
                  </span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{merchant.category}</span>
                  {merchant.rating > 0 && (
                    <>
                      <span className="text-sm">•</span>
                      <span className="flex items-center text-sm">
                        <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                        {merchant.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            {merchant.businessPhone && (
              <div className="flex items-center text-gray-600 hover:text-blue-600 transition">
                <Phone className="w-4 h-4 mr-2" />
                <a href={`tel:${merchant.businessPhone}`} className="text-sm">
                  {merchant.businessPhone}
                </a>
              </div>
            )}
            {merchant.businessEmail && (
              <div className="flex items-center text-gray-600 hover:text-blue-600 transition">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${merchant.businessEmail}`} className="text-sm">
                  {merchant.businessEmail}
                </a>
              </div>
            )}
            {merchant.address && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{merchant.address}</span>
              </div>
            )}
            {merchant.website && (
              <div className="flex items-center text-gray-600 hover:text-blue-600 transition">
                <Globe className="w-4 h-4 mr-2" />
                <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-sm">
                  Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-600" />
            About the Business
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {merchant.description || 'No description provided.'}
          </p>
          
          {/* Business Details */}
          {(merchant.yearEstablished || merchant.licenseNumber) && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              {merchant.yearEstablished && (
                <div>
                  <span className="text-gray-500">Established:</span>
                  <span className="ml-2 font-medium">{merchant.yearEstablished}</span>
                </div>
              )}
              {merchant.licenseNumber && (
                <div>
                  <span className="text-gray-500">License:</span>
                  <span className="ml-2 font-medium">{merchant.licenseNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features/Services based on business type */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section - for PRODUCT type */}
          {merchant.businessType === 'PRODUCT' && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Products
                </h2>
                
                {merchant.products && merchant.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {merchant.products.map(product => (
                      <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition">
                        <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          {product.images ? (
                            <img src={JSON.parse(product.images)[0]} alt={product.name} className="h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <p className="text-blue-600 font-bold mt-1">ETB {product.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No products yet</p>
                )}
                
                <div className="mt-4 text-center">
                  <Link
                    to={`/merchant/${merchant.id}/products`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Manage Products →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Merchant Portal Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Merchant Portal</h2>
              <p className="text-blue-100 mb-6 text-sm">
                Manage your products, view orders, and track performance
              </p>
              
              <div className="space-y-3">
                <Link
                  to={`/merchant/${merchant.id}/products`}
                  className="block w-full bg-white text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition text-center"
                >
                  Manage Products
                </Link>
                
                <Link
                  to={`/merchant/${merchant.id}/orders`}
                  className="block w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-400 transition text-center"
                >
                  View Orders
                </Link>
                
                <Link
                  to={`/merchant/${merchant.id}/reports`}
                  className="block w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-400 transition text-center"
                >
                  Sales Reports
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-blue-400 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{merchant.totalOrders || 0}</div>
                  <div className="text-xs text-blue-200">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {merchant.totalRevenue ? `ETB ${merchant.totalRevenue}` : '0'}
                  </div>
                  <div className="text-xs text-blue-200">Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantPage;