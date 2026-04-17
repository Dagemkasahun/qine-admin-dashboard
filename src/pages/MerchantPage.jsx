// src/pages/MerchantPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Store, Plus, Settings, Camera, X, Save, 
  Image as ImageIcon, Home, Bell, CheckCircle,
  MapPin, Package, Info, ShoppingBag, BarChart3,
  Users, LogOut, Menu, XCircle, ArrowLeft, Upload,
  Phone, Mail, Globe, Clock, Calendar, Award, Target,
  Heart, Share2, ExternalLink
} from 'lucide-react';
import { merchantApi } from '../api/merchants';

const MerchantPage = () => {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- MODAL STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- DATA STATE ---
  const [businessModel, setBusinessModel] = useState({
    id: merchantId,
    name: '',
    type: '',
    category: '',
    description: '',
    location: '',
    status: '',
    email: '',
    phone: '',
    coverImage: null,
    logo: null,
    joinedDate: '',
    // New fields for company profile
    foundedYear: '',
    employees: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    achievements: [],
    certifications: [],
    managerName: '',
    managerPhone: '',
    managerEmail: ''
  });

  // Fetch merchant data
  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const data = await merchantApi.getById(merchantId);
        setBusinessModel({
          id: data.id,
          name: data.businessName,
          type: data.businessType,
          category: data.category,
          description: data.description,
          location: data.address,
          status: data.status,
          email: data.businessEmail,
          phone: data.businessPhone,
          coverImage: data.coverImage,
          logo: data.logo,
          joinedDate: new Date(data.createdAt).toLocaleDateString(),
          foundedYear: data.foundedYear || '2015',
          employees: data.employees || '10-25',
          website: data.website || '',
          socialMedia: data.socialMedia || {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
          },
          businessHours: data.businessHours || businessModel.businessHours,
          achievements: data.achievements || [
            'Certified Ethiopian Exporters Association',
            'ISO 22000:2018 Food Safety Certified',
            'Best Organic Product Award 2023'
          ],
          certifications: data.certifications || [
            'Organic Farming Certificate',
            'Quality Management System ISO 9001',
            'Fair Trade Certified'
          ],
          managerName: data.managerName || data.owner?.firstName + ' ' + data.owner?.lastName,
          managerPhone: data.managerPhone || data.businessPhone,
          managerEmail: data.managerEmail || data.businessEmail
        });
      } catch (error) {
        console.error('Error fetching merchant:', error);
      }
    };
    
    if (merchantId) {
      fetchMerchant();
    }
  }, [merchantId]);

  // Navigation tabs - Updated with Company Profile tab
  const navTabs = [
    { id: 'dashboard', path: '', label: 'Dashboard', icon: Home, exact: true },
    { id: 'products', path: 'products', label: 'Products', icon: Package },
    { id: 'inventory', path: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', path: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'analytics', path: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'company', path: 'company', label: 'Company', icon: Info },
    { id: 'staff', path: 'staff', label: 'Staff', icon: Users },
  ];

  // --- HANDLERS ---
  const handleProfileUpdate = async (updatedData) => {
    try {
      setLoading(true);
      
      const updatePayload = {
        businessName: updatedData.name,
        description: updatedData.description,
        address: updatedData.location,
        city: updatedData.city || 'Addis Ababa',
        businessPhone: updatedData.phone,
        businessEmail: updatedData.email,
        logo: updatedData.logo,
        coverImage: updatedData.coverImage,
        foundedYear: updatedData.foundedYear,
        employees: updatedData.employees,
        website: updatedData.website,
        socialMedia: updatedData.socialMedia,
        businessHours: updatedData.businessHours,
        managerName: updatedData.managerName,
        managerPhone: updatedData.managerPhone,
        managerEmail: updatedData.managerEmail
      };
      
      await merchantApi.updateProfile(merchantId, updatePayload);
      
      setBusinessModel(prev => ({ 
        ...prev, 
        name: updatedData.name,
        description: updatedData.description,
        location: updatedData.location,
        phone: updatedData.phone,
        email: updatedData.email,
        logo: updatedData.logo,
        coverImage: updatedData.coverImage,
        foundedYear: updatedData.foundedYear,
        employees: updatedData.employees,
        website: updatedData.website,
        socialMedia: updatedData.socialMedia,
        businessHours: updatedData.businessHours,
        managerName: updatedData.managerName,
        managerPhone: updatedData.managerPhone,
        managerEmail: updatedData.managerEmail
      }));
      
      setIsProfileModalOpen(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
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
              {businessModel.name.substring(0, 2)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Business Header Card - Enhanced */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          {/* Cover Image Area */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative group">
            {businessModel.coverImage ? (
              <img src={businessModel.coverImage} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="text-center">
                  <Store className="w-12 h-12 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Cover Image</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <Camera className="w-3 h-3" /> Change Cover
            </button>
          </div>

          {/* Profile Details Area - Enhanced with more info */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="relative group/logo">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-lg border border-slate-100">
                    {businessModel.logo ? (
                      <img src={businessModel.logo} className="w-full h-full object-cover rounded-xl" alt="Logo" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                        {businessModel.name.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover/logo:opacity-100 transition"
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
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {businessModel.location}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {businessModel.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Est. {businessModel.foundedYear}</span>
                  </div>
                </div>
              </div>
              
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

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Products</p>
                <p className="text-lg font-bold text-slate-800">156</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Orders</p>
                <p className="text-lg font-bold text-slate-800">1,234</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Rating</p>
                <p className="text-lg font-bold text-yellow-500">★ 4.8</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Employees</p>
                <p className="text-lg font-bold text-slate-800">{businessModel.employees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Updated with Company tab */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {navTabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/merchant/${merchantId}/${tab.path}`}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Dynamic Content */}
        <Outlet context={{ merchantId, businessModel, setBusinessModel }} />
      </div>

      {/* Mobile Menu */}
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
                  key={tab.id}
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

      {/* Profile Modal - Enhanced with company info fields */}
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

// Enhanced Profile Modal Component with Company Information
const ProfileModal = ({ businessModel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: businessModel.name,
    description: businessModel.description,
    location: businessModel.location,
    phone: businessModel.phone,
    email: businessModel.email,
    coverImage: businessModel.coverImage,
    logo: businessModel.logo,
    foundedYear: businessModel.foundedYear || '',
    employees: businessModel.employees || '',
    website: businessModel.website || '',
    managerName: businessModel.managerName || '',
    managerPhone: businessModel.managerPhone || '',
    managerEmail: businessModel.managerEmail || '',
    socialMedia: businessModel.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    businessHours: businessModel.businessHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [coverPreview, setCoverPreview] = useState(businessModel.coverImage);
  const [logoPreview, setLogoPreview] = useState(businessModel.logo);
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [saving, setSaving] = useState(false);

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

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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

        {/* Tab Navigation inside Modal */}
        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-4">
            {['basic', 'company', 'contact', 'hours'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'basic' && 'Basic Info'}
                {tab === 'company' && 'Company Details'}
                {tab === 'contact' && 'Contact & Social'}
                {tab === 'hours' && 'Business Hours'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
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
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Location</label>
                  <input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Description</label>
                <textarea 
                  rows="4" 
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" 
                  placeholder="Tell customers about your business history, mission, and values..."
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
            </>
          )}

          {/* Company Details Tab */}
          {activeTab === 'company' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Founded Year</label>
                  <input 
                    type="number"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({...formData, foundedYear: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g., 2015"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Number of Employees</label>
                  <select
                    value={formData.employees}
                    onChange={(e) => setFormData({...formData, employees: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="10-25">10-25 employees</option>
                    <option value="25-50">25-50 employees</option>
                    <option value="50-100">50-100 employees</option>
                    <option value="100+">100+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Website</label>
                <input 
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Management Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Manager Name</label>
                    <input 
                      value={formData.managerName}
                      onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Manager Phone</label>
                    <input 
                      value={formData.managerPhone}
                      onChange={(e) => setFormData({...formData, managerPhone: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="+251..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Manager Email</label>
                    <input 
                      type="email"
                      value={formData.managerEmail}
                      onChange={(e) => setFormData({...formData, managerEmail: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="manager@example.com"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contact & Social Tab */}
          {activeTab === 'contact' && (
            <>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Social Media Links</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1877f2] rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <input
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <input
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="Instagram URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1da1f2] rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <input
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="Twitter URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0a66c2] rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <input
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Business Hours Tab */}
          {activeTab === 'hours' && (
            <>
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-24">
                      <span className="font-semibold text-slate-700 capitalize">{day}</span>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.businessHours[day].closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-500">Closed</span>
                    </label>
                    {!formData.businessHours[day].closed && (
                      <>
                        <input
                          type="time"
                          value={formData.businessHours[day].open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="p-2 bg-white border border-slate-200 rounded-lg outline-none"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={formData.businessHours[day].close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="p-2 bg-white border border-slate-200 rounded-lg outline-none"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save All Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MerchantPage;