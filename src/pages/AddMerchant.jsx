// src/pages/AddMerchant.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Store, Upload, Phone, Mail, MapPin, Image } from 'lucide-react';
import { api } from '../services/api';

const AddMerchant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    // Business Info
    businessName: '',
    businessType: 'PRODUCT',
    category: '',
    subCategory: '',
    description: '',
    
    // Contact
    businessPhone: '',
    businessEmail: '',
    website: '',
    
    // Location
    address: '',
    city: 'Addis Ababa',
    subCity: '',
    latitude: '',
    longitude: '',
    
    // Business Details
    licenseNumber: '',
    tinNumber: '',
    yearEstablished: '',
    
    // Features
    hasProducts: true,
    hasInventory: true,
    hasDelivery: true,
    hasBooking: false,
    
    // IDs (will be set by server)
    ownerId: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, create a temporary owner (in production, this would be the logged-in user)
      // For now, we'll use a default owner ID or create one
      const tempOwner = {
        email: formData.businessEmail,
        phone: formData.businessPhone,
        password: 'temporary123', // This should be handled properly
        firstName: formData.businessName.split(' ')[0] || 'Owner',
        lastName: formData.businessName.split(' ')[1] || 'User',
        role: 'MERCHANT'
      };

      // Create owner user first (or use existing user)
      let ownerId;
      try {
        const userResponse = await api.auth.register(tempOwner);
        ownerId = userResponse.id;
      } catch (userError) {
        console.log('User might already exist, using fallback');
        ownerId = 'temp-owner-id'; // In production, you'd handle this properly
      }

      // Prepare merchant data
      const merchantData = {
        ownerId: ownerId,
        businessName: formData.businessName,
        businessType: formData.businessType,
        category: formData.category,
        subCategory: formData.subCategory || null,
        description: formData.description || null,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        website: formData.website || null,
        address: formData.address,
        city: formData.city,
        subCity: formData.subCity || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        licenseNumber: formData.licenseNumber || null,
        tinNumber: formData.tinNumber || null,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        
        // Images as base64 for now (in production, you'd upload to cloud storage)
        logo: logoPreview,
        coverImage: coverPreview,
        
        // JSON fields
        configuration: JSON.stringify({
          hasProducts: formData.hasProducts,
          hasInventory: formData.hasInventory,
          hasDelivery: formData.hasDelivery,
          hasBooking: formData.hasBooking
        }),
        
        status: 'PENDING',
        rating: 0,
        totalReviews: 0,
        totalOrders: 0,
        totalRevenue: 0
      };

      console.log('Submitting merchant data:', merchantData);
      
      // Send to API
      const response = await api.merchants.create(merchantData);
      console.log('Merchant created:', response);
      
      alert('✅ Merchant created successfully! It will be reviewed by admin.');
      navigate('/merchants');
    } catch (error) {
      console.error('Error creating merchant:', error);
      alert('❌ Error creating merchant: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/merchants')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Add New Merchant</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC International School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="PRODUCT">Product (Shop)</option>
                  <option value="SERVICE">Service (School/Consultant)</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="PROMOTION">Promotion Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Restaurant, Education"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ethiopian Cuisine"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell customers about your business..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="businessPhone"
                    required
                    value={formData.businessPhone}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+251911223344"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="businessEmail"
                    required
                    value={formData.businessEmail}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@example.com"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Location Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full business address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Addis Ababa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub City
                </label>
                <input
                  type="text"
                  name="subCity"
                  value={formData.subCity}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bole"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9.0089"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="38.7945"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Business Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="LIC-123-2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TIN Number
                </label>
                <input
                  type="text"
                  name="tinNumber"
                  value={formData.tinNumber}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TIN-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Est.
                </label>
                <input
                  type="number"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Images</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition">
                  {logoPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-32 h-32 mx-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a logo</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition">
                  {coverPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload cover image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleCoverChange}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasProducts"
                  checked={formData.hasProducts}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Has Products</span>
              </label>
              
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasInventory"
                  checked={formData.hasInventory}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Track Inventory</span>
              </label>
              
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasDelivery"
                  checked={formData.hasDelivery}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Offers Delivery</span>
              </label>
              
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasBooking"
                  checked={formData.hasBooking}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">Accepts Bookings</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/merchants')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Merchant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMerchant;