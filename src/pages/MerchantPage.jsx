import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Store, Plus, Settings, Camera, X, Save, 
  Image as ImageIcon, Home, Bell, CheckCircle,
  MapPin, Package, Info, ShoppingBag, BarChart3,
  Users, LogOut, Menu, XCircle, ArrowLeft, Upload,
  Search, Clock
} from 'lucide-react';
import { merchantApi } from '../services/merchant'; // Adjust the path as needed

const MerchantPage = () => {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- MODAL STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ← Fixed here
  const [loading, setLoading] = useState(true);
  
  // --- DATA STATE ---
  const [businessModel, setBusinessModel] = useState({
    id: merchantId,
    name: '',
    type: '',
    category: '',
    subCategory: '',
    description: '',
    location: '',
    city: '',
    status: '',
    email: '',
    phone: '',
    coverImage: null,
    logo: null,
    configuration: {}
  });

  // Navigation tabs for merchant sub-pages
  const navTabs = [
    { path: '', label: 'Dashboard', icon: Home, exact: true },
    { path: 'products', label: 'Products', icon: Package },
    { path: 'inventory', label: 'Inventory', icon: Package },
    { path: 'orders', label: 'Orders', icon: ShoppingBag },
    { path: 'analytics', label: 'Analytics', icon: BarChart3 },
    { path: 'staff', label: 'Staff', icon: Users },
  ];

  // --- FETCH MERCHANT DATA ON MOUNT ---
  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!merchantId) return;
      
      try {
        setLoading(true);
        const data = await merchantApi.getById(merchantId);
        
        // Map API data to businessModel structure
        setBusinessModel({
          id: data.id,
          name: data.businessName,
          type: data.businessType,
          category: data.category,
          subCategory: data.subCategory || '',
          description: data.description || '',
          location: data.address,
          city: data.city,
          status: data.status,
          email: data.businessEmail,
          phone: data.businessPhone,
          coverImage: data.coverImage,
          logo: data.logo,
          configuration: data.configuration || {}
        });
      } catch (error) {
        console.error('Error fetching merchant data:', error);
        alert('❌ Error loading merchant data: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantData();
  }, [merchantId]);

  // --- HANDLERS ---
  const handleProfileUpdate = async (updatedData) => {
    try {
      // Prepare data for API
      const apiData = {
        businessName: updatedData.name,
        businessType: updatedData.type,
        category: updatedData.category,
        subCategory: updatedData.subCategory,
        description: updatedData.description,
        address: updatedData.location,
        city: updatedData.city || businessModel.city,
        businessPhone: updatedData.phone,
        businessEmail: updatedData.email,
        logo: updatedData.logo,
        coverImage: updatedData.coverImage,
        configuration: updatedData.configuration || businessModel.configuration
      };
      
      // Call the API to update merchant profile
      const response = await merchantApi.updateProfile(merchantId, apiData);
      
      // Update local state with API response
      setBusinessModel({
        id: response.id,
        name: response.businessName,
        type: response.businessType,
        category: response.category,
        subCategory: response.subCategory || '',
        description: response.description || '',
        location: response.address,
        city: response.city,
        status: response.status,
        email: response.businessEmail,
        phone: response.businessPhone,
        coverImage: response.coverImage,
        logo: response.logo,
        configuration: response.configuration || {}
      });
      
      setIsProfileModalOpen(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleExitMerchant = () => {
    navigate('/merchants');
  };

  const isActiveTab = (path, exact = false) => {
    if (exact) {
      return location.pathname === `/merchant/${merchantId}`;
    }
    return location.pathname === `/merchant/${merchantId}/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading merchant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExitMerchant}
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400"
              title="Back to Merchants"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-100">
                <Store className="text-white w-4 h-4" />
              </div>
              <h1 className="font-bold text-lg text-slate-800 tracking-tight">
                Merchant Center
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* Edit Profile Button */}
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-200 transition"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </button>
            
            <button 
              onClick={handleExitMerchant}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
            
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
              {businessModel.name ? businessModel.name.substring(0, 2) : 'MB'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* --- BUSINESS HEADER CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          {/* Cover Image Area */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-50 to-indigo-50 relative group">
            {businessModel.coverImage ? (
              <img src={businessModel.coverImage} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
            )}
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <Camera className="w-3 h-3" /> Change Cover
            </button>
          </div>

          {/* Profile Details Area */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                {/* Logo/Icon */}
                <div className="relative group/logo">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 shadow-lg border border-slate-100">
                    {businessModel.logo ? (
                      <img src={businessModel.logo} className="w-full h-full object-cover rounded-lg" alt="Logo" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        {businessModel.name ? businessModel.name.charAt(0) : 'B'}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover/logo:opacity-100 transition"
                  >
                    <Camera className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{businessModel.name}</h2>
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" /> {businessModel.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {businessModel.location}, {businessModel.city}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {businessModel.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {businessModel.type}</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex sm:hidden gap-2">
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider"
                >
                  <Settings className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={handleExitMerchant}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" /> Exit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- TAB NAVIGATION (Horizontal Tabs) --- */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {navTabs.map((tab) => (
              <Link
                key={tab.path || 'dashboard'}
                to={`/merchant/${merchantId}/${tab.path}`}
                className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-all ${
                  isActiveTab(tab.path, tab.exact)
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* --- DYNAMIC CONTENT --- */}
        <Outlet context={{ 
          merchantId,
          businessModel,
          setBusinessModel
        }} />
      </div>

      {/* --- MOBILE BOTTOM SHEET MENU --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Quick Navigation</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {navTabs.map((tab) => (
                <Link
                  key={tab.path || 'dashboard'}
                  to={`/merchant/${merchantId}/${tab.path}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActiveTab(tab.path, tab.exact)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </Link>
              ))}
              <div className="border-t border-slate-100 my-3 pt-3">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    handleExitMerchant();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Exit Merchant</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* --- ENHANCED PROFILE MODAL (with Image Upload) --- */}
      {isProfileModalOpen && (
        <ProfileModal 
          businessModel={businessModel}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ businessModel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: businessModel.name,
    type: businessModel.type,
    category: businessModel.category,
    location: businessModel.location,
    city: businessModel.city,
    description: businessModel.description,
    email: businessModel.email,
    phone: businessModel.phone,
    coverImage: businessModel.coverImage,
    logo: businessModel.logo,
    subCategory: businessModel.subCategory,
    configuration: businessModel.configuration
  });
  
  const [coverPreview, setCoverPreview] = useState(businessModel.coverImage);
  const [logoPreview, setLogoPreview] = useState(businessModel.logo);
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
        setFormData(prev => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold">Edit Business Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Cover Image</label>
            <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden group">
              {coverPreview ? (
                <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition"
              >
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-sm">Change Cover</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Business Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden relative group">
                {logoPreview ? (
                  <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-400">Recommended: Square image, 200x200px</p>
            </div>
          </div>

          {/* Business Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Business Name *</label>
              <input 
                name="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Business Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option>Product (Shop)</option>
                <option>Service</option>
                <option>Restaurant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Category</label>
              <input 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Sub Category</label>
              <input 
                value={formData.subCategory}
                onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Location/Address</label>
              <input 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">City</label>
              <input 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Description</label>
            <textarea 
              rows="3" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Phone</label>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
              />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-blue-600 transition">
            <Save className="w-4 h-4" /> Save All Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default MerchantPage;