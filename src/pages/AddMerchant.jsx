// src/pages/AddMerchant.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Store, Upload, Phone, Mail, MapPin, Image, User } from 'lucide-react';
import apiClient from '@/api/client';

const AddMerchant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    // Owner Information (REQUIRED for foreign key)
    ownerUsername: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',        // Optional
    ownerPhone: '',        // Optional
    ownerPassword: '',
    
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
      // STEP 1: Create owner user with username
      console.log('Step 1: Creating owner account...');
      const userData = {
        username: formData.ownerUsername,
        password: formData.ownerPassword,
        firstName: formData.ownerFirstName,
        lastName: formData.ownerLastName,
        email: formData.ownerEmail || null,
        phone: formData.ownerPhone || null,
        role: 'MERCHANT'
      };

      console.log('User data being sent:', { ...userData, password: '******' });

      const userResponse = await apiClient.post('/auth/register', userData);
      const ownerId = userResponse.data.id;
      console.log('Owner created with ID:', ownerId);

      // STEP 2: Create merchant with ownerId
      console.log('Step 2: Creating merchant...');
      const merchantData = {
        ownerId: ownerId,
        businessName: formData.businessName,
        businessType: formData.businessType,
        category: formData.category,
        subCategory: formData.subCategory || null,
        description: formData.description || null,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail || formData.ownerEmail,
        website: formData.website || null,
        address: formData.address,
        city: formData.city,
        subCity: formData.subCity || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        licenseNumber: formData.licenseNumber || null,
        tinNumber: formData.tinNumber || null,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : null,
        logo: logoPreview,
        coverImage: coverPreview,
        configuration: JSON.stringify({
          hasProducts: formData.hasProducts,
          hasInventory: formData.hasInventory,
          hasDelivery: formData.hasDelivery,
          hasBooking: formData.hasBooking
        }),
        status: 'PENDING'
      };

      console.log('Submitting merchant data:', merchantData);
      
      const response = await apiClient.post('/merchants', merchantData);
      console.log('Merchant created:', response.data);
      
      alert('✅ Merchant created successfully! It will be reviewed by admin.');
      navigate('/merchants');
    } catch (error) {
      console.error('Error creating merchant:', error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`❌ Error: ${errorMessage}`);
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
          {/* Owner Information - Required Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-200">
              Owner Information (Required)
            </h2>
            <p className="text-sm text-blue-600 mb-4">This creates the merchant's owner account for login</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="ownerUsername"
                    required
                    value={formData.ownerUsername}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., john_doe_store"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will be used for merchant login (unique)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerFirstName"
                  required
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerLastName"
                  required
                  value={formData.ownerLastName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="ownerPassword"
                  required
                  value={formData.ownerPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+251911223344"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="pl-10 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="owner@personal.com"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Can be same as business email</p>
              </div>
            </div>
          </div>

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
                  Business Phone <span className="text-red-500">*</span>
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
                  Business Email <span className="text-red-500">*</span>
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
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Images</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition">
                  {logoPreview ? (
                    <div className="space-y-3">
                      <img src={logoPreview} alt="Logo preview" className="w-32 h-32 mx-auto object-contain rounded-lg" />
                      <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="text-sm text-red-600">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <label className="cursor-pointer text-blue-600">Upload logo<input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} /></label>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-500 transition">
                  {coverPreview ? (
                    <div className="space-y-3">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="text-sm text-red-600">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <label className="cursor-pointer text-blue-600">Upload cover<input type="file" className="hidden" accept="image/*" onChange={handleCoverChange} /></label>
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
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" name="hasProducts" checked={formData.hasProducts} onChange={handleChange} />
                <span>Has Products</span>
              </label>
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" name="hasInventory" checked={formData.hasInventory} onChange={handleChange} />
                <span>Track Inventory</span>
              </label>
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" name="hasDelivery" checked={formData.hasDelivery} onChange={handleChange} />
                <span>Offers Delivery</span>
              </label>
              <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" name="hasBooking" checked={formData.hasBooking} onChange={handleChange} />
                <span>Accepts Bookings</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/merchants')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating...</> : <><Save className="w-4 h-4 mr-2" />Create Merchant</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMerchant;