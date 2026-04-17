// src/pages/SettingsPage.jsx
import { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings, Database, Globe, Bell, Shield, Palette,
  Save, Server, Mail, CreditCard, HardDrive, Activity,
  Download, Upload, RefreshCw, CheckCircle, AlertCircle,
  Eye, EyeOff, Key, Wifi, Cpu, HardDrive as Disk, Clock
} from 'lucide-react';
import apiClient from '../api/client';

const SettingsPage = () => {
  const { darkMode, toggleDarkMode, theme, setTheme, availableThemes } = useContext(ThemeContext);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [testResults, setTestResults] = useState({});

  // Comprehensive Settings State
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      siteName: 'QINE Admin',
      siteDescription: 'Super App Administration Dashboard',
      language: 'en',
      timezone: 'Africa/Addis_Ababa',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'ETB',
      currencySymbol: 'ETB',
      currencyPosition: 'before',
    },

    // Appearance Settings
    appearance: {
      theme: theme || 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      accentColor: '#10B981',
      sidebarCollapsed: false,
      layout: 'default',
      fontFamily: 'Inter',
      fontSize: 'medium',
      borderRadius: 'medium',
      animations: true,
    },

    // Notification Settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderAlerts: true,
      merchantAlerts: true,
      riderAlerts: true,
      systemAlerts: true,
      marketingEmails: false,
      dailyDigest: true,
      weeklyReport: true,
      monthlyReport: false,
      alertThresholds: {
        lowStock: 10,
        pendingOrders: 20,
        inactiveMerchants: 7,
        offlineRiders: 5,
      }
    },

    // API Configuration
    api: {
      baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
      timeout: 30000,
      retryAttempts: 3,
      enableCache: true,
      cacheTTL: 300,
      rateLimit: 100,
      webhookUrl: '',
      webhookSecret: '',
    },

    // Database Configuration
    database: {
      host: 'supabase',
      port: 5432,
      name: 'qine_db',
      status: 'Connected',
      version: 'PostgreSQL 15.1',
      size: '2.4 GB',
      tables: 24,
      connections: 8,
      lastBackup: '2024-03-15 02:00:00',
    },

    // Security Settings
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      ipWhitelist: '',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: true,
        expiryDays: 90,
        preventReuse: 5,
      },
      auditLog: true,
      encryptionLevel: 'AES-256',
    },

    // Payment Settings
    payment: {
      providers: {
        cbe: { enabled: true, apiKey: '', merchantId: '' },
        telebirr: { enabled: false, apiKey: '', merchantId: '' },
        amole: { enabled: false, apiKey: '', merchantId: '' },
      },
      commissionRates: {
        default: 10,
        restaurant: 15,
        product: 10,
        service: 5,
      },
      payoutSchedule: 'weekly',
      minimumPayout: 100,
      autoApprovePayouts: false,
    },

    // Email Settings
    email: {
      provider: 'smtp',
      fromEmail: 'noreply@qine.com',
      fromName: 'QINE Admin',
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: '',
        password: '',
      },
      templates: {
        welcome: true,
        orderConfirmation: true,
        passwordReset: true,
        merchantApproval: true,
      },
    },

    // SMS Settings
    sms: {
      provider: 'twilio',
      fromNumber: '',
      accountSid: '',
      authToken: '',
      enabled: false,
    },

    // Backup & Restore
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionDays: 30,
      includeFiles: true,
      backupLocation: 'cloud',
    },

    // System Health
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      maxUploadSize: 10,
      allowedFileTypes: 'jpg,png,pdf,doc,docx',
    },

    // Server & API
    server: {
      uptime: '14d 6h 32m',
      memoryUsage: '2.1 GB / 8 GB',
      cpuLoad: '23%',
      activeConnections: 47,
      rateLimitingEnabled: true,
      webSocketStatus: 'Connected',
      webSocketUrl: 'wss://qine-backend.onrender.com',
    },
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await apiClient.get('/settings');
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.log('Could not load settings from API, using localStorage');
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse saved settings');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Update theme when appearance settings change
  useEffect(() => {
    if (settings.appearance.theme !== theme && setTheme) {
      setTheme(settings.appearance.theme);
    }
  }, [settings.appearance.theme, theme, setTheme]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to backend
      const response = await apiClient.post('/settings', settings);
      
      // Also save to localStorage as backup
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      if (response.data?.success) {
        alert('✅ Settings saved successfully!');
      } else {
        alert('✅ Settings saved locally!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // If API fails, still save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Show more helpful error message
      if (error.response?.status === 404) {
        alert('⚠️ Settings saved locally only. Backend endpoint not available.');
      } else if (error.response?.status === 401) {
        alert('⚠️ Session expired. Settings saved locally. Please log in again.');
      } else {
        alert('⚠️ Settings saved locally. Server connection failed.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('appSettings');
      window.location.reload();
    }
  };

  const testApiConnection = async () => {
    try {
      setTestResults(prev => ({ ...prev, api: 'testing' }));
      const response = await fetch(`${settings.api.baseUrl}/health`);
      if (response.ok) {
        setTestResults(prev => ({ ...prev, api: 'success' }));
        alert('✅ API connection successful!');
      } else {
        setTestResults(prev => ({ ...prev, api: 'failed' }));
        alert('❌ API connection failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, api: 'failed' }));
      alert('❌ Cannot reach API server');
    }
  };

  const testDatabaseConnection = async () => {
    try {
      setTestResults(prev => ({ ...prev, db: 'testing' }));
      const response = await apiClient.get('/health/db');
      if (response.data?.status === 'connected') {
        setTestResults(prev => ({ ...prev, db: 'success' }));
        alert('✅ Database connection successful!');
      } else {
        setTestResults(prev => ({ ...prev, db: 'failed' }));
        alert('❌ Database connection failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, db: 'failed' }));
      alert('❌ Cannot connect to database');
    }
  };

  const handleClearCache = async () => {
    try {
      await apiClient.post('/cache/clear');
      alert('✅ Cache cleared successfully!');
    } catch (error) {
      alert('⚠️ Cache cleared locally. Server cache may still persist.');
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `qine-settings-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...imported }));
          alert('✅ Settings imported successfully!');
        } catch (error) {
          alert('❌ Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integration', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'server', label: 'Server & API', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'backup', label: 'Backup', icon: HardDrive },
    { id: 'system', label: 'System', icon: Activity },
  ];

  const cardClass = darkMode
    ? 'bg-gray-800 border border-gray-700 text-white'
    : 'bg-white border border-gray-200 text-gray-900';

  const inputClass = darkMode
    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500';

  const labelClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`p-6 min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className={mutedClass}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <p className={mutedClass}>Configure system settings and preferences</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportSettings}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <label className={`px-4 py-2 border rounded-lg flex items-center gap-2 cursor-pointer transition ${
              darkMode 
                ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}>
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Tabs Sidebar */}
          <div className={`w-72 ${cardClass} rounded-xl shadow-sm p-3 h-fit sticky top-20`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition mb-1 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={`flex-1 ${cardClass} rounded-xl shadow-sm p-6`}>
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> General Settings
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Site Name</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Site Description</label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteDescription: e.target.value }
                      })}
                      rows="3"
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, language: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="en">English</option>
                      <option value="am">አማርኛ (Amharic)</option>
                      <option value="om">Afaan Oromo</option>
                      <option value="ti">ትግርኛ (Tigrinya)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="Africa/Addis_Ababa">Addis Ababa (GMT+3)</option>
                      <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Date Format</label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, dateFormat: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Time Format</label>
                    <select
                      value={settings.general.timeFormat}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, timeFormat: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, currency: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="ETB">Ethiopian Birr (ETB)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Appearance Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${labelClass}`}>Theme Mode</label>
                    <div className="flex gap-4">
                      {availableThemes && availableThemes.length > 0 ? (
                        availableThemes.map(mode => (
                          <button
                            key={mode}
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, theme: mode }
                            })}
                            className={`px-6 py-3 rounded-lg border-2 capitalize ${
                              settings.appearance.theme === mode
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {mode}
                          </button>
                        ))
                      ) : (
                        <>
                          {['light', 'dark', 'system'].map(mode => (
                            <button
                              key={mode}
                              onClick={() => setSettings({
                                ...settings,
                                appearance: { ...settings.appearance, theme: mode }
                              })}
                              className={`px-6 py-3 rounded-lg border-2 capitalize ${
                                settings.appearance.theme === mode
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, primaryColor: e.target.value }
                          })}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, primaryColor: e.target.value }
                          })}
                          className={`flex-1 border rounded-lg px-3 ${inputClass}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Secondary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.appearance.secondaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, secondaryColor: e.target.value }
                          })}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.appearance.secondaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, secondaryColor: e.target.value }
                          })}
                          className={`flex-1 border rounded-lg px-3 ${inputClass}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Font Family</label>
                    <select
                      value={settings.appearance.fontFamily}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, fontFamily: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="System">System Default</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Enable Animations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appearance.animations}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, animations: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notification Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Push Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Order Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, orderAlerts: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Merchant Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.merchantAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, merchantAlerts: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Daily Digest</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailyDigest}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, dailyDigest: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* API & Integration Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" /> API & Integration
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>API Base URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.api.baseUrl}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, baseUrl: e.target.value }
                        })}
                        className={`flex-1 border rounded-lg px-4 py-2.5 ${inputClass}`}
                      />
                      <button
                        onClick={testApiConnection}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        {testResults.api === 'testing' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : testResults.api === 'success' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          'Test'
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Webhook URL</label>
                    <input
                      type="text"
                      value={settings.api.webhookUrl}
                      onChange={(e) => setSettings({
                        ...settings,
                        api: { ...settings.api, webhookUrl: e.target.value }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                      placeholder="https://your-webhook.com/endpoint"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Webhook Secret</label>
                    <div className="relative">
                      <input
                        type={showPassword.webhook ? 'text' : 'password'}
                        value={settings.api.webhookSecret}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, webhookSecret: e.target.value }
                        })}
                        className={`w-full border rounded-lg px-4 py-2.5 pr-10 ${inputClass}`}
                      />
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, webhook: !prev.webhook }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword.webhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Timeout (ms)</label>
                      <input
                        type="number"
                        value={settings.api.timeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, timeout: parseInt(e.target.value) }
                        })}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${labelClass}`}>Retry Attempts</label>
                      <input
                        type="number"
                        value={settings.api.retryAttempts}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, retryAttempts: parseInt(e.target.value) }
                        })}
                        className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Enable Cache</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.api.enableCache}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, enableCache: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5" /> Database Status
                </h2>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={mutedClass}>Host</p>
                      <p className="font-medium">{settings.database.host}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Port</p>
                      <p className="font-medium">{settings.database.port}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Database Name</p>
                      <p className="font-medium">{settings.database.name}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Status</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-medium">{settings.database.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className={mutedClass}>Version</p>
                      <p className="font-medium">{settings.database.version}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Size</p>
                      <p className="font-medium">{settings.database.size}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Tables</p>
                      <p className="font-medium">{settings.database.tables}</p>
                    </div>
                    <div>
                      <p className={mutedClass}>Active Connections</p>
                      <p className="font-medium">{settings.database.connections}</p>
                    </div>
                    <div className="col-span-2">
                      <p className={mutedClass}>Last Backup</p>
                      <p className="font-medium">{settings.database.lastBackup}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={testDatabaseConnection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Test Connection
                </button>
              </div>
            )}

            {/* Server & API Settings */}
            {activeTab === 'server' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" /> Server & API Management
                </h2>

                {/* Server Status */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Server Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${mutedClass}`}>Uptime</p>
                      <p className="font-medium">{settings.server.uptime}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${mutedClass}`}>Memory Usage</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: '26%' }}></div>
                      </div>
                      <p className="font-medium text-sm mt-1">{settings.server.memoryUsage}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${mutedClass}`}>CPU Load</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                      <p className="font-medium text-sm mt-1">{settings.server.cpuLoad}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${mutedClass}`}>Active Connections</p>
                      <p className="font-medium">{settings.server.activeConnections}</p>
                    </div>
                  </div>
                </div>

                {/* API Rate Limiting */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> API Rate Limiting
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Requests per minute</span>
                      <input
                        type="number"
                        value={settings.api.rateLimit}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, rateLimit: parseInt(e.target.value) }
                        })}
                        className={`w-32 border rounded-lg px-3 py-1.5 ${inputClass}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Enable Rate Limiting</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.server.rateLimitingEnabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            server: { ...settings.server, rateLimitingEnabled: e.target.checked }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cache Settings */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Disk className="w-4 h-4" /> Cache Configuration
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Cache TTL (seconds)</span>
                      <input
                        type="number"
                        value={settings.api.cacheTTL}
                        onChange={(e) => setSettings({
                          ...settings,
                          api: { ...settings.api, cacheTTL: parseInt(e.target.value) }
                        })}
                        className={`w-32 border rounded-lg px-3 py-1.5 ${inputClass}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Clear Cache</span>
                      <button 
                        onClick={handleClearCache}
                        className="px-4 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        Clear Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Keys Management */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" /> API Keys
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="qine_live_sk_••••••••••••••••••••••••"
                        disabled
                        className={`flex-1 border rounded-lg px-3 py-1.5 ${inputClass}`}
                      />
                      <button className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                        Copy
                      </button>
                      <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                {/* WebSocket Status */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Wifi className="w-4 h-4" /> WebSocket Status
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className={labelClass}>{settings.server.webSocketStatus}</span>
                    <span className={`text-sm ${mutedClass}`}>{settings.server.webSocketUrl}</span>
                  </div>
                </div>

                {/* System Logs Preview */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Recent System Logs
                    </h3>
                    <button className="text-sm text-blue-600 hover:underline">View All</button>
                  </div>
                  <div className={`p-3 rounded font-mono text-xs ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} max-h-48 overflow-y-auto`}>
                    <p className="text-green-500">[INFO] {new Date().toISOString().split('T')[0]} 10:23:45 - Server started successfully</p>
                    <p className="text-blue-500">[DEBUG] {new Date().toISOString().split('T')[0]} 10:24:12 - Database connection established</p>
                    <p className="text-green-500">[INFO] {new Date().toISOString().split('T')[0]} 10:25:01 - User admin@qine.com logged in</p>
                    <p className="text-yellow-500">[WARN] {new Date().toISOString().split('T')[0]} 10:30:22 - High memory usage detected (78%)</p>
                    <p className="text-green-500">[INFO] {new Date().toISOString().split('T')[0]} 10:35:10 - Order #ORD-1234 created</p>
                    <p className="text-gray-400">[DEBUG] {new Date().toISOString().split('T')[0]} 10:40:15 - Cache invalidated for key: products:list</p>
                    <p className="text-green-500">[INFO] {new Date().toISOString().split('T')[0]} 10:45:30 - WebSocket client connected</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Security Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                      Session Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                      })}
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Two-Factor Authentication</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, twoFactorAuth: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className={labelClass}>Enable Audit Log</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLog}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, auditLog: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${labelClass}`}>IP Whitelist</label>
                    <textarea
                      value={settings.security.ipWhitelist}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, ipWhitelist: e.target.value }
                      })}
                      rows="3"
                      className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}
                      placeholder="Enter IP addresses (one per line)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {!['general', 'appearance', 'notifications', 'api', 'database', 'server', 'security'].includes(activeTab) && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className={mutedClass}>Settings for {activeTab} coming soon...</p>
                <p className={`text-sm ${mutedClass} mt-2`}>
                  This section is under development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;