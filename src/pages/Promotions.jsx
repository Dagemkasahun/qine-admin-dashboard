// src/pages/Promotions.jsx - WITH IMAGE UPLOAD
import { useState, useEffect, useContext, useRef } from 'react';
import {
  Megaphone, Plus, Search, Edit, Trash2, Eye,
  Tag, Percent, DollarSign, Calendar, Users,
  Store, CheckCircle, XCircle, RefreshCw,
  Clock, Gift, AlertCircle, Copy, Save, X,
  Image, Upload, Camera
} from 'lucide-react';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { showToast } from '../utils/toast';

const PROMOTION_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage Discount', icon: Percent, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  { value: 'FIXED', label: 'Fixed Amount Off', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
  { value: 'BUY_X_GET_Y', label: 'Buy X Get Y', icon: Gift, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
];

const Promotions = () => {
  const { darkMode } = useContext(ThemeContext);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [promotionMode, setPromotionMode] = useState('details'); // 'details' or 'image'
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrder: '',
    maxDiscount: '',
    code: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perUserLimit: '1',
    applicableTo: 'ALL',
    image: '',
    terms: '',
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/promotions');
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showToast.error('Failed to load promotions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  const handleAdd = () => {
    setEditingPromotion(null);
    setPromotionMode('details');
    setImagePreview(null);
    setFormData({
      name: '', description: '', type: 'PERCENTAGE', value: '',
      minOrder: '', maxDiscount: '', code: '', startDate: '', endDate: '',
      usageLimit: '', perUserLimit: '1', applicableTo: 'ALL',
      image: '', terms: '', isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setPromotionMode('details');
    setImagePreview(promotion.image || null);
    setFormData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'PERCENTAGE',
      value: promotion.value || '',
      minOrder: promotion.minOrder || '',
      maxDiscount: promotion.maxDiscount || '',
      code: promotion.code || '',
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      usageLimit: promotion.usageLimit || '',
      perUserLimit: promotion.perUserLimit || '1',
      applicableTo: promotion.applicableTo || 'ALL',
      image: promotion.image || '',
      terms: promotion.terms || '',
      isActive: promotion.isActive,
    });
    setShowModal(true);
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('Image must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setImagePreview(base64);
        setFormData(prev => ({ ...prev, image: base64 }));
        showToast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        showToast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    // Only validate name, dates in image-only mode
    if (promotionMode === 'image') {
      if (!imagePreview) {
        showToast.warning('Please upload an image');
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        showToast.warning('Please set start and end dates');
        return;
      }
      // Auto-generate name for image-only promotions
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: 'Promotional Banner' }));
      }
    } else {
      if (!formData.name || !formData.type || !formData.value || !formData.startDate || !formData.endDate) {
        showToast.warning('Please fill in all required fields');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        type: promotionMode === 'image' ? 'PERCENTAGE' : formData.type,
        value: promotionMode === 'image' ? '0' : formData.value,
        name: formData.name || 'Promotional Banner',
      };

      if (editingPromotion) {
        await apiClient.put(`/promotions/${editingPromotion.id}`, payload);
        showToast.success('Promotion updated!');
      } else {
        await apiClient.post('/promotions', payload);
        showToast.success('Promotion created!');
      }
      setShowModal(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      showToast.error(error.response?.data?.error || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete promotion "${name}"?`)) return;
    try {
      await apiClient.delete(`/promotions/${id}`);
      showToast.success('Promotion deleted');
      fetchPromotions();
    } catch (error) {
      showToast.error('Failed to delete promotion');
    }
  };

  const handleDuplicate = (promotion) => {
    setEditingPromotion(null);
    setPromotionMode('details');
    setImagePreview(promotion.image || null);
    setFormData({
      ...formData,
      name: `${promotion.name} (Copy)`,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value,
      minOrder: promotion.minOrder || '',
      maxDiscount: promotion.maxDiscount || '',
      code: '',
      startDate: '',
      endDate: '',
      usageLimit: promotion.usageLimit || '',
      perUserLimit: promotion.perUserLimit || '1',
      applicableTo: promotion.applicableTo || 'ALL',
      image: promotion.image || '',
      terms: promotion.terms || '',
      isActive: false,
    });
    setShowModal(true);
  };

  const getTypeInfo = (type) => {
    return PROMOTION_TYPES.find(t => t.value === type) || PROMOTION_TYPES[0];
  };

  const isExpired = (endDate) => new Date(endDate) < new Date();
  const isUpcoming = (startDate) => new Date(startDate) > new Date();

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = p.isActive && !isExpired(p.endDate);
    else if (statusFilter === 'expired') matchesStatus = isExpired(p.endDate);
    else if (statusFilter === 'upcoming') matchesStatus = isUpcoming(p.startDate);
    else if (statusFilter === 'inactive') matchesStatus = !p.isActive;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900';

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.isActive && !isExpired(p.endDate)).length,
    expired: promotions.filter(p => isExpired(p.endDate)).length,
    upcoming: promotions.filter(p => isUpcoming(p.startDate)).length,
  };

  if (loading) {
    return <div className="p-6"><DashboardSkeleton /></div>;
  }

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Megaphone className="inline w-6 h-6 mr-2 text-purple-500" />
            Promotions
          </h1>
          <p className={mutedText}>Create and manage promotional offers for customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Promotion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${cardClass} rounded-lg shadow p-4`}>
          <p className={`text-sm ${mutedText}`}>Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 border-l-4 border-green-500`}>
          <p className={`text-sm ${mutedText}`}>Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 border-l-4 border-red-500`}>
          <p className={`text-sm ${mutedText}`}>Expired</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-4 border-l-4 border-blue-500`}>
          <p className={`text-sm ${mutedText}`}>Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search promotions..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}>
            <option value="all">All Types</option>
            {PROMOTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`border rounded-lg px-3 py-2 text-sm ${inputClass}`}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      {filteredPromotions.length === 0 ? (
        <EmptyState
          icon="default"
          title="No promotions found"
          description="Create your first promotion to attract more customers."
          action={handleAdd}
          actionLabel="Create Promotion"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => {
            const typeInfo = getTypeInfo(promo.type);
            const expired = isExpired(promo.endDate);
            const upcoming = isUpcoming(promo.startDate);
            const isImagePromo = promo.image && promo.value === 0;
            
            return (
              <div key={promo.id} className={`${cardClass} rounded-xl shadow hover:shadow-lg transition overflow-hidden ${
                !promo.isActive ? 'opacity-60' : ''
              }`}>
                {/* Image Banner (if exists) */}
                {promo.image && (
                  <div className="h-40 overflow-hidden">
                    <img src={promo.image} alt={promo.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Header */}
                <div className={`p-4 ${typeInfo.bg} border-b dark:border-gray-700`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {isImagePromo ? (
                        <Image className="w-5 h-5 text-blue-500" />
                      ) : (
                        <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
                      )}
                      <span className={`text-xs font-bold ${isImagePromo ? 'text-blue-500' : typeInfo.color}`}>
                        {isImagePromo ? 'Banner' : typeInfo.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {expired ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">Expired</span>
                      ) : upcoming ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">Upcoming</span>
                      ) : promo.isActive ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 rounded-full text-xs">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{promo.name}</h3>
                  {promo.description && (
                    <p className={`text-sm ${mutedText} mb-3 line-clamp-2`}>{promo.description}</p>
                  )}

                  {/* Discount Badge (only for non-image promos) */}
                  {!isImagePromo && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-purple-600">
                        {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `ETB ${promo.value}`}
                      </span>
                      <span className={`text-sm ${mutedText}`}>
                        {promo.type === 'PERCENTAGE' ? 'OFF' : 'off'}
                      </span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-1.5 text-sm">
                    {promo.code && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-purple-600 font-bold">{promo.code}</code>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={mutedText}>
                        {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {promo.minOrder > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className={mutedText}>Min order: ETB {promo.minOrder}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className={mutedText}>
                        Used: {promo.usedCount || 0}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={`px-4 py-3 border-t flex justify-end gap-2 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <button onClick={() => handleDuplicate(promo)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(promo)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(promo.id, promo.name)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b flex justify-between items-center sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-bold">
                {editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setPromotionMode('details')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    promotionMode === 'details'
                      ? 'bg-white dark:bg-gray-600 shadow text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Tag className="w-4 h-4 inline mr-1" /> Offer Details
                </button>
                <button
                  onClick={() => setPromotionMode('image')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    promotionMode === 'image'
                      ? 'bg-white dark:bg-gray-600 shadow text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image className="w-4 h-4 inline mr-1" /> Image Banner
                </button>
              </div>

              {/* IMAGE BANNER MODE */}
              {promotionMode === 'image' && (
                <div className="space-y-4">
                  <p className={`text-sm ${mutedText}`}>
                    Upload a promotional banner image. Only dates are required for image banners.
                  </p>

                  {/* Image Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${mutedText}`}>Banner Image</label>
                    {imagePreview ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition">
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100"
                          >
                            <Upload className="w-4 h-4 inline mr-1" /> Change
                          </button>
                          <button
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition"
                      >
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className={`text-sm font-medium ${mutedText}`}>Click to upload banner image</p>
                        <p className={`text-xs ${mutedText} mt-1`}>PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Name (optional for image) */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Banner Name (optional)</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} placeholder="e.g., Summer Sale Banner" />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Start Date *</label>
                      <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>End Date *</label>
                      <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                    <span className={mutedText}>Active (visible to customers)</span>
                  </div>
                </div>
              )}

              {/* OFFER DETAILS MODE */}
              {promotionMode === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} placeholder="e.g., Summer Sale 50% Off" />
                    </div>
                    <div className="col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Description</label>
                      <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} placeholder="Describe your promotion..." />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Type *</label>
                      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}>
                        {PROMOTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Value *</label>
                      <input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                        placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 100'} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Start Date *</label>
                      <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>End Date *</label>
                      <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Coupon Code</label>
                      <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} placeholder="e.g., SUMMER50" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Usage Limit</label>
                      <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} placeholder="Leave empty for unlimited" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Min Order (ETB)</label>
                      <input type="number" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Max Discount (ETB)</label>
                      <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                    <span className={mutedText}>Active (visible to customers)</span>
                  </div>
                </div>
              )}

              {/* Save Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  {saving ? 'Saving...' : <><Save className="w-4 h-4" /> {editingPromotion ? 'Update' : 'Create'} Promotion</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;