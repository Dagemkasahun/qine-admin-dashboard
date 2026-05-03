// src/pages/Profile.jsx - ENHANCED WITH REAL API & IMAGE UPLOAD
import { useState, useEffect, useContext, useRef } from 'react';
import {
  User, Mail, Phone, Camera, Save, Shield, Calendar,
  MapPin, Building2, Key, Eye, EyeOff, Loader2, CheckCircle
} from 'lucide-react';
import apiClient from '../api/client';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';

const Profile = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({});
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    profileImage: '',
    role: '',
    status: '',
    createdAt: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
        profileImage: user.profileImage || '',
        role: user.role || '',
        status: user.status || '',
        createdAt: user.createdAt || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) {
      showToast.error('User ID not found. Please log in again.');
      return;
    }
    
    setSaving(true);
    try {
      const response = await apiClient.put(`/users/${user.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        profileImage: formData.profileImage,
      });
      
      // Update local storage
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      
      showToast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Fallback to PATCH if PUT fails
      try {
        const patchResponse = await apiClient.patch(`/users/${user.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          profileImage: formData.profileImage,
        });
        
        const updatedUser = { ...user, ...patchResponse.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
        
        showToast.success('Profile updated successfully!');
      } catch (patchError) {
        showToast.error('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showToast.warning('Please enter current password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast.warning('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      showToast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const mutedText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const pageBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className={`p-6 min-h-screen ${pageBg}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Profile
          </h1>
          <p className={mutedText}>Manage your account information and security settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : `${cardClass} ${mutedText} hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Avatar Card */}
            <div className={`${cardClass} rounded-xl shadow p-6 text-center`}>
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {imagePreview || formData.profileImage ? (
                    <img src={imagePreview || formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.firstName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <h2 className="text-xl font-bold mt-4">{formData.firstName} {formData.lastName}</h2>
              <p className={mutedText}>@{formData.username}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                formData.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                <CheckCircle className="w-3 h-3" /> {formData.status}
              </span>
            </div>

            {/* Edit Form */}
            <div className={`${cardClass} rounded-xl shadow p-6`}>
              <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>
                    <Mail className="w-3 h-3 inline mr-1" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>
                    <Phone className="w-3 h-3 inline mr-1" /> Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className={`w-full border rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-600 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    className={`w-full border rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-600 cursor-not-allowed`}
                  />
                </div>
                {formData.createdAt && (
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${mutedText}`}>
                      <Calendar className="w-3 h-3 inline mr-1" /> Member Since
                    </label>
                    <input
                      type="text"
                      value={new Date(formData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      disabled
                      className={`w-full border rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-600 cursor-not-allowed`}
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className={`${cardClass} rounded-xl shadow p-6`}>
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Key className="w-5 h-5" /> Change Password
            </h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={`w-full border rounded-lg px-4 py-2.5 pr-10 ${inputClass}`}
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedText}`}>New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full border rounded-lg px-4 py-2.5 pr-10 ${inputClass}`}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${mutedText}`}>Confirm New Password</label>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                  placeholder="Re-enter new password"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;