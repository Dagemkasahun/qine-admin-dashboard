// src/pages/SettingsPage.jsx - COMPLETE FIXED VERSION
import { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings, Database, Globe, Bell, Shield, Palette,
  Save, Server, Mail, CreditCard, HardDrive, Activity,
  Download, Upload, RefreshCw, CheckCircle, AlertCircle,
  Eye, EyeOff, Key, Wifi, Cpu, HardDrive as Disk, Clock,
  DollarSign, Building2, Banknote, Send, FileText, Edit,
  Terminal, Link, Lock, AlertTriangle, Square, RotateCw,
  Trash2
} from 'lucide-react';
import apiClient from '../api/client';

const SettingsPage = () => {
  const { darkMode, theme, setTheme } = useContext(ThemeContext);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [testResults, setTestResults] = useState({});
  const [serverStatus, setServerStatus] = useState('running');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  
  // FIX: Prevent theme auto-change - just track initial load
  const initialLoad = useRef(true);
  
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      // Don't auto-change theme - user controls it from header toggle
    }
  }, []);

  // Comprehensive Settings State
  const [settings, setSettings] = useState({
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
    appearance: {
      theme: theme || 'light',
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      fontSize: 'medium',
      borderRadius: 'medium',
      animations: true,
    },
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
      alertThresholds: { lowStock: 10, pendingOrders: 20, inactiveMerchants: 7, offlineRiders: 5 }
    },
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
    database: {
      host: 'supabase',
      port: 5432,
      name: 'qine_db',
      username: 'postgres',
      password: '',
      status: 'Connected',
      version: 'PostgreSQL 15.1',
      size: '2.4 GB',
      tables: 24,
      connections: 8,
      lastBackup: '2024-03-15 02:00:00',
      ssl: true,
      poolMin: 2,
      poolMax: 10,
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false,
      ipWhitelist: '',
      passwordPolicy: {
        minLength: 8, requireUppercase: true, requireLowercase: true,
        requireNumbers: true, requireSpecial: true, expiryDays: 90, preventReuse: 5
      },
      auditLog: true,
      encryptionLevel: 'AES-256',
      jwtSecret: '',
      jwtExpiry: '30d',
      corsOrigins: '',
    },
    payment: {
      providers: {
        cbe: { enabled: true, apiKey: '', merchantId: '' },
        telebirr: { enabled: false, apiKey: '', merchantId: '' },
        amole: { enabled: false, apiKey: '', merchantId: '' },
      },
      commissionRates: { default: 10, restaurant: 15, product: 10, service: 5 },
      payoutSchedule: 'weekly',
      minimumPayout: 100,
      autoApprovePayouts: false,
    },
    email: {
      provider: 'smtp',
      fromEmail: 'noreply@qine.com',
      fromName: 'QINE Admin',
      smtp: { host: 'smtp.gmail.com', port: 587, secure: false, username: '', password: '' },
      templates: { welcome: true, orderConfirmation: true, passwordReset: true, merchantApproval: true },
    },
    sms: { provider: 'twilio', fromNumber: '', accountSid: '', authToken: '', enabled: false },
    backup: { autoBackup: true, backupFrequency: 'daily', backupTime: '02:00', retentionDays: 30, includeFiles: true, backupLocation: 'cloud' },
    system: { maintenanceMode: false, debugMode: false, logLevel: 'info', maxUploadSize: 10, allowedFileTypes: 'jpg,png,pdf,doc,docx' },
    server: {
      port: 5002, host: '0.0.0.0', environment: 'production', nodeVersion: '18.x',
      restartPolicy: 'always', maxMemory: '512mb', workerThreads: 4,
      keepAliveTimeout: 5000, headersTimeout: 6000,
      uptime: '14d 6h 32m', memoryUsage: '2.1 GB / 8 GB', cpuLoad: '23%', activeConnections: 47,
      rateLimitingEnabled: true, webSocketStatus: 'Connected', webSocketUrl: 'wss://qine-backend.onrender.com',
      sslEnabled: false, sslCertPath: '', sslKeyPath: '',
      compressionEnabled: true, helmetEnabled: true, morganLogging: true, corsEnabled: true,
    },
  });

  useEffect(() => { loadSettings(); fetchServerStatus(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/settings');
      if (response.data) {
        setSettings(prev => {
          const merged = { ...prev };
          Object.keys(response.data).forEach(cat => {
            if (merged[cat] && typeof response.data[cat] === 'object') {
              merged[cat] = { ...merged[cat], ...response.data[cat] };
            }
          });
          return merged;
        });
      }
    } catch {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(prev => {
            const merged = { ...prev };
            Object.keys(parsed).forEach(cat => {
              if (merged[cat] && typeof parsed[cat] === 'object') {
                merged[cat] = { ...merged[cat], ...parsed[cat] };
              }
            });
            return merged;
          });
        } catch {}
      }
    } finally { setLoading(false); }
  };

  const fetchServerStatus = async () => {
    try {
      const res = await apiClient.get('/health');
      if (res.data) {
        setSettings(prev => ({
          ...prev,
          server: { ...prev.server, uptime: res.data.uptime ? `${Math.floor(res.data.uptime/86400)}d ${Math.floor((res.data.uptime%86400)/3600)}h` : prev.server.uptime }
        }));
        setServerStatus('running');
      }
    } catch { setServerStatus('offline'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.post('/settings', settings);
      localStorage.setItem('appSettings', JSON.stringify(settings));
      alert(res.data?.success ? '✅ Settings saved!' : '✅ Saved locally!');
    } catch (err) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      alert('⚠️ Saved locally. Server connection failed.');
    } finally { setSaving(false); }
  };

  const handleServerRestart = async () => {
    if (!confirm('⚠️ Restart server? All connections will be terminated.')) return;
    try { await apiClient.post('/system/restart'); alert('🔄 Restarting...'); setServerStatus('restarting'); }
    catch { alert('❌ Failed to restart.'); }
  };

  const handleServerStop = async () => {
    if (!confirm('🛑 Stop server? App will be unavailable.')) return;
    try { await apiClient.post('/system/stop'); alert('🛑 Stopping...'); setServerStatus('stopped'); }
    catch { alert('❌ Failed to stop.'); }
  };

  const handleClearLogs = async () => {
    if (!confirm('🗑️ Delete all system logs?')) return;
    try { await apiClient.delete('/system/logs'); alert('✅ Logs cleared!'); }
    catch { alert('❌ Failed to clear logs.'); }
  };

  const handleClearCache = async () => {
    try { await apiClient.post('/cache/clear'); alert('✅ Cache cleared!'); }
    catch { alert('⚠️ Cache cleared locally.'); }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      localStorage.removeItem('appSettings');
      window.location.reload();
    }
  };

  const testApiConnection = async () => {
    setTestResults(prev => ({ ...prev, api: 'testing' }));
    try {
      const res = await fetch(`${settings.api.baseUrl}/health`);
      setTestResults(prev => ({ ...prev, api: res.ok ? 'success' : 'failed' }));
      alert(res.ok ? '✅ API connected!' : '❌ API failed');
    } catch { setTestResults(prev => ({ ...prev, api: 'failed' })); alert('❌ Cannot reach server'); }
  };

  const testDbConnection = async () => {
    setTestResults(prev => ({ ...prev, db: 'testing' }));
    try {
      const res = await apiClient.get('/health/db');
      setTestResults(prev => ({ ...prev, db: res.data?.status === 'connected' ? 'success' : 'failed' }));
      alert(res.data?.status === 'connected' ? '✅ DB connected!' : '❌ DB failed');
    } catch { setTestResults(prev => ({ ...prev, db: 'failed' })); alert('❌ Cannot connect to DB'); }
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `qine-settings-${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        setSettings(prev => {
          const merged = { ...prev };
          Object.keys(imported).forEach(cat => {
            if (merged[cat] && typeof imported[cat] === 'object') merged[cat] = { ...merged[cat], ...imported[cat] };
          });
          return merged;
        });
        alert('✅ Imported!');
      } catch { alert('❌ Invalid file'); }
    };
    reader.readAsText(file);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integration', icon: Globe },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'server', label: 'Server Config', icon: Server, superAdminOnly: true },
    { id: 'security', label: 'Security', icon: Shield, superAdminOnly: true },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'backup', label: 'Backup', icon: HardDrive },
    { id: 'system', label: 'System', icon: Activity, superAdminOnly: true },
  ];

  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500';
  const labelClass = darkMode ? 'text-gray-300' : 'text-gray-700';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  // Helper: update nested settings
  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className={`p-6 min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center"><RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" /><p className={mutedClass}>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            <p className={mutedClass}>{!isSuperAdmin && <span className="text-orange-500">(Read-only)</span>}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportSettings} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}><Download className="w-4 h-4" /> Export</button>
            <label className={`px-4 py-2 border rounded-lg flex items-center gap-2 cursor-pointer ${darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}`}><Upload className="w-4 h-4" /> Import<input type="file" accept=".json" onChange={importSettings} className="hidden" /></label>
            <button onClick={handleReset} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"><RefreshCw className="w-4 h-4" /> Reset</button>
            {isSuperAdmin && <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save All'}</button>}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`w-72 ${cardClass} rounded-xl shadow-sm p-3 h-fit sticky top-20`}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { if (tab.superAdminOnly && !isSuperAdmin) { alert('⚠️ Super Admin only.'); return; } setActiveTab(tab.id); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition mb-1 ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`} ${tab.superAdminOnly && !isSuperAdmin ? 'opacity-50' : ''}`}>
                <tab.icon className="w-5 h-5" /><span className="font-medium">{tab.label}{tab.superAdminOnly && <Lock className="w-3 h-3 inline ml-1 text-orange-500" />}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={`flex-1 ${cardClass} rounded-xl shadow-sm p-6`}>
            
            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5" /> General Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Site Name</label><input type="text" value={settings.general.siteName} onChange={e => updateSetting('general', 'siteName', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  <div className="col-span-2"><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Site Description</label><textarea value={settings.general.siteDescription} onChange={e => updateSetting('general', 'siteDescription', e.target.value)} rows="3" className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Language</label><select value={settings.general.language} onChange={e => updateSetting('general', 'language', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="en">English</option><option value="am">አማርኛ</option><option value="om">Afaan Oromo</option><option value="ti">ትግርኛ</option></select></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Timezone</label><select value={settings.general.timezone} onChange={e => updateSetting('general', 'timezone', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="Africa/Addis_Ababa">Addis Ababa (GMT+3)</option><option value="UTC">UTC</option></select></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Date Format</label><select value={settings.general.dateFormat} onChange={e => updateSetting('general', 'dateFormat', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Time Format</label><select value={settings.general.timeFormat} onChange={e => updateSetting('general', 'timeFormat', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="12h">12-hour</option><option value="24h">24-hour</option></select></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Currency</label><select value={settings.general.currency} onChange={e => updateSetting('general', 'currency', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="ETB">ETB</option><option value="USD">USD</option></select></div>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</h2>
                <div><label className={`block text-sm font-medium mb-2 ${labelClass}`}>Theme Mode</label><div className="flex gap-4">{['light', 'dark', 'system'].map(m => <button key={m} onClick={() => updateSetting('appearance', 'theme', m)} className={`px-6 py-3 rounded-lg border-2 capitalize ${settings.appearance.theme === m ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>{m}</button>)}</div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Primary Color</label><div className="flex gap-2"><input type="color" value={settings.appearance.primaryColor} onChange={e => updateSetting('appearance', 'primaryColor', e.target.value)} className="w-12 h-10 border rounded" /><input type="text" value={settings.appearance.primaryColor} onChange={e => updateSetting('appearance', 'primaryColor', e.target.value)} className={`flex-1 border rounded-lg px-3 ${inputClass}`} /></div></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Secondary Color</label><div className="flex gap-2"><input type="color" value={settings.appearance.secondaryColor} onChange={e => updateSetting('appearance', 'secondaryColor', e.target.value)} className="w-12 h-10 border rounded" /><input type="text" value={settings.appearance.secondaryColor} onChange={e => updateSetting('appearance', 'secondaryColor', e.target.value)} className={`flex-1 border rounded-lg px-3 ${inputClass}`} /></div></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Font Family</label><select value={settings.appearance.fontFamily} onChange={e => updateSetting('appearance', 'fontFamily', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="Inter">Inter</option><option value="Roboto">Roboto</option><option value="Poppins">Poppins</option></select></div>
                  <div className="flex items-center"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.appearance.animations} onChange={e => updateSetting('appearance', 'animations', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label><span className={`ml-3 ${labelClass}`}>Enable Animations</span></div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
                <div className="space-y-4">
                  {['emailNotifications','pushNotifications','smsNotifications','orderAlerts','merchantAlerts','riderAlerts','systemAlerts','dailyDigest','weeklyReport','monthlyReport'].map(key => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className={labelClass}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                      <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.notifications[key]} onChange={e => updateSetting('notifications', key, e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API & INTEGRATION */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Globe className="w-5 h-5" /> API & Integration</h2>
                <div className="space-y-4">
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>API Base URL</label><div className="flex gap-2"><input type="text" value={settings.api.baseUrl} onChange={e => updateSetting('api', 'baseUrl', e.target.value)} className={`flex-1 border rounded-lg px-4 py-2.5 ${inputClass}`} /><button onClick={testApiConnection} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{testResults.api === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : testResults.api === 'success' ? <CheckCircle className="w-4 h-4" /> : 'Test'}</button></div></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Webhook URL</label><input type="text" value={settings.api.webhookUrl} onChange={e => updateSetting('api', 'webhookUrl', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Webhook Secret</label><div className="relative"><input type={showPassword.webhook ? 'text' : 'password'} value={settings.api.webhookSecret} onChange={e => updateSetting('api', 'webhookSecret', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 pr-10 ${inputClass}`} /><button onClick={() => setShowPassword(p => ({ ...p, webhook: !p.webhook }))} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword.webhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Timeout (ms)</label><input type="number" value={settings.api.timeout} onChange={e => updateSetting('api', 'timeout', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Retry Attempts</label><input type="number" value={settings.api.retryAttempts} onChange={e => updateSetting('api', 'retryAttempts', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  </div>
                  <div className="flex items-center justify-between"><span className={labelClass}>Enable Cache</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.api.enableCache} onChange={e => updateSetting('api', 'enableCache', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                </div>
              </div>
            )}

            {/* DATABASE */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Database className="w-5 h-5" /> Database</h2>
                {isSuperAdmin && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className="font-medium mb-4 flex items-center gap-2"><Link className="w-4 h-4 text-blue-500" /> Connection Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Host</label><input type="text" value={settings.database.host} onChange={e => updateSetting('database', 'host', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Port</label><input type="number" value={settings.database.port} onChange={e => updateSetting('database', 'port', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Database Name</label><input type="text" value={settings.database.name} onChange={e => updateSetting('database', 'name', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Username</label><input type="text" value={settings.database.username} onChange={e => updateSetting('database', 'username', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Password</label><div className="relative"><input type={showPassword.db ? 'text' : 'password'} value={settings.database.password} onChange={e => updateSetting('database', 'password', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 pr-10 ${inputClass}`} /><button onClick={() => setShowPassword(p => ({ ...p, db: !p.db }))} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword.db ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                      <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Pool (Min-Max)</label><div className="flex gap-2"><input type="number" value={settings.database.poolMin} onChange={e => updateSetting('database', 'poolMin', parseInt(e.target.value))} className={`w-1/2 border rounded-lg px-3 py-2.5 ${inputClass}`} placeholder="Min" /><input type="number" value={settings.database.poolMax} onChange={e => updateSetting('database', 'poolMax', parseInt(e.target.value))} className={`w-1/2 border rounded-lg px-3 py-2.5 ${inputClass}`} placeholder="Max" /></div></div>
                    </div>
                    <div className="flex items-center mt-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.database.ssl} onChange={e => updateSetting('database', 'ssl', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label><span className={`ml-3 ${labelClass}`}>Enable SSL</span></div>
                  </div>
                )}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className={mutedClass}>Status</p><div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span><span className="font-medium">{settings.database.status}</span></div></div>
                    <div><p className={mutedClass}>Version</p><p className="font-medium">{settings.database.version}</p></div>
                    <div><p className={mutedClass}>Size</p><p className="font-medium">{settings.database.size}</p></div>
                    <div><p className={mutedClass}>Tables</p><p className="font-medium">{settings.database.tables}</p></div>
                    <div><p className={mutedClass}>Connections</p><p className="font-medium">{settings.database.connections}</p></div>
                    <div><p className={mutedClass}>Last Backup</p><p className="font-medium">{settings.database.lastBackup}</p></div>
                  </div>
                </div>
                <button onClick={testDbConnection} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Test Connection</button>
              </div>
            )}

            {/* SERVER CONFIG */}
            {activeTab === 'server' && isSuperAdmin && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Server className="w-5 h-5" /> Server Configuration</h2>
                  <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${serverStatus === 'running' ? 'bg-green-500' : serverStatus === 'restarting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span><span className={`text-sm font-medium ${serverStatus === 'running' ? 'text-green-500' : 'text-red-500'}`}>{serverStatus === 'running' ? 'Running' : serverStatus === 'restarting' ? 'Restarting...' : 'Offline'}</span></div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-4 flex items-center gap-2"><Terminal className="w-4 h-4 text-blue-500" /> Basic Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Port</label><input type="number" value={settings.server.port} onChange={e => updateSetting('server', 'port', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Host</label><input type="text" value={settings.server.host} onChange={e => updateSetting('server', 'host', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Environment</label><select value={settings.server.environment} onChange={e => updateSetting('server', 'environment', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`}><option value="development">Development</option><option value="production">Production</option></select></div>
                    <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Max Memory</label><input type="text" value={settings.server.maxMemory} onChange={e => updateSetting('server', 'maxMemory', e.target.value)} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border-2 border-red-300 dark:border-red-700 ${darkMode ? 'bg-red-900/10' : 'bg-red-50'}`}>
                  <h3 className="font-medium mb-4 flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Server Control</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleServerRestart} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"><RotateCw className="w-4 h-4" /> Restart</button>
                    <button onClick={handleServerStop} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"><Square className="w-4 h-4" /> Stop</button>
                    <button onClick={handleClearLogs} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Clear Logs</button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Shield className="w-5 h-5" /> Security</h2>
                <div className="space-y-4">
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Session Timeout (s)</label><input type="number" value={settings.security.sessionTimeout} onChange={e => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>Max Login Attempts</label><input type="number" value={settings.security.maxLoginAttempts} onChange={e => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))} className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                  <div className="flex items-center justify-between"><span className={labelClass}>2FA</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.security.twoFactorAuth} onChange={e => updateSetting('security', 'twoFactorAuth', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                  <div><label className={`block text-sm font-medium mb-1 ${labelClass}`}>IP Whitelist</label><textarea value={settings.security.ipWhitelist} onChange={e => updateSetting('security', 'ipWhitelist', e.target.value)} rows="3" className={`w-full border rounded-lg px-4 py-2.5 ${inputClass}`} /></div>
                </div>
              </div>
            )}

            {/* PAYMENT */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> Commission Rates</h3>
                  {Object.entries(settings.payment.commissionRates).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between mb-3"><span className={`capitalize ${labelClass}`}>{key} (%)</span><input type="number" value={val} onChange={e => setSettings(prev => ({...prev, payment: {...prev.payment, commissionRates: {...prev.payment.commissionRates, [key]: parseFloat(e.target.value)}}}))} className={`w-24 border rounded-lg px-3 py-1.5 ${inputClass}`} /></div>
                  ))}
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-4">Providers</h3>
                  {Object.entries(settings.payment.providers).map(([key, prov]) => (
                    <div key={key} className="mb-3 p-3 border rounded-lg dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2"><span className="font-medium capitalize">{key}</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={prov.enabled} onChange={e => setSettings(prev => ({...prev, payment: {...prev.payment, providers: {...prev.payment.providers, [key]: {...prov, enabled: e.target.checked}}}}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                      {prov.enabled && <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="API Key" value={prov.apiKey} onChange={e => setSettings(prev => ({...prev, payment: {...prev.payment, providers: {...prev.payment.providers, [key]: {...prov, apiKey: e.target.value}}}}))} className={`border rounded-lg px-3 py-1.5 text-sm ${inputClass}`} /><input type="text" placeholder="Merchant ID" value={prov.merchantId} onChange={e => setSettings(prev => ({...prev, payment: {...prev.payment, providers: {...prev.payment.providers, [key]: {...prov, merchantId: e.target.value}}}}))} className={`border rounded-lg px-3 py-1.5 text-sm ${inputClass}`} /></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMAIL */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Mail className="w-5 h-5" /> Email</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-medium mb-4">SMTP Server</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm mb-1 ${labelClass}`}>Host</label><input type="text" value={settings.email.smtp.host} onChange={e => setSettings(prev => ({...prev, email: {...prev.email, smtp: {...prev.email.smtp, host: e.target.value}}}))} className={`w-full border rounded-lg px-3 py-2 ${inputClass}`} /></div>
                    <div><label className={`block text-sm mb-1 ${labelClass}`}>Port</label><input type="number" value={settings.email.smtp.port} onChange={e => setSettings(prev => ({...prev, email: {...prev.email, smtp: {...prev.email.smtp, port: parseInt(e.target.value)}}}))} className={`w-full border rounded-lg px-3 py-2 ${inputClass}`} /></div>
                    <div><label className={`block text-sm mb-1 ${labelClass}`}>Username</label><input type="text" value={settings.email.smtp.username} onChange={e => setSettings(prev => ({...prev, email: {...prev.email, smtp: {...prev.email.smtp, username: e.target.value}}}))} className={`w-full border rounded-lg px-3 py-2 ${inputClass}`} /></div>
                    <div><label className={`block text-sm mb-1 ${labelClass}`}>Password</label><div className="relative"><input type={showPassword.smtp ? 'text' : 'password'} value={settings.email.smtp.password} onChange={e => setSettings(prev => ({...prev, email: {...prev.email, smtp: {...prev.email.smtp, password: e.target.value}}}))} className={`w-full border rounded-lg px-3 py-2 pr-10 ${inputClass}`} /><button onClick={() => setShowPassword(p => ({...p, smtp: !p.smtp}))} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={`block text-sm mb-1 ${labelClass}`}>From Name</label><input type="text" value={settings.email.fromName} onChange={e => updateSetting('email', 'fromName', e.target.value)} className={`w-full border rounded-lg px-3 py-2 ${inputClass}`} /></div>
                  <div><label className={`block text-sm mb-1 ${labelClass}`}>From Email</label><input type="email" value={settings.email.fromEmail} onChange={e => updateSetting('email', 'fromEmail', e.target.value)} className={`w-full border rounded-lg px-3 py-2 ${inputClass}`} /></div>
                </div>
              </div>
            )}

            {/* BACKUP */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><HardDrive className="w-5 h-5" /> Backup</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className={labelClass}>Auto Backup</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.backup.autoBackup} onChange={e => updateSetting('backup', 'autoBackup', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                    <div className="flex items-center justify-between"><span className={labelClass}>Frequency</span><select value={settings.backup.backupFrequency} onChange={e => updateSetting('backup', 'backupFrequency', e.target.value)} className={`w-40 border rounded-lg px-3 py-1.5 ${inputClass}`}><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
                    <div className="flex items-center justify-between"><span className={labelClass}>Retention (days)</span><input type="number" value={settings.backup.retentionDays} onChange={e => updateSetting('backup', 'retentionDays', parseInt(e.target.value))} className={`w-24 border rounded-lg px-3 py-1.5 ${inputClass}`} /></div>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Activity className="w-5 h-5" /> System</h2>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><div><span className={labelClass}>Maintenance Mode</span></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.system.maintenanceMode} onChange={e => updateSetting('system', 'maintenanceMode', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                    <div className="flex items-center justify-between"><div><span className={labelClass}>Debug Mode</span></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.system.debugMode} onChange={e => updateSetting('system', 'debugMode', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                    <div className="flex items-center justify-between"><span className={labelClass}>Log Level</span><select value={settings.system.logLevel} onChange={e => updateSetting('system', 'logLevel', e.target.value)} className={`w-40 border rounded-lg px-3 py-1.5 ${inputClass}`}><option value="debug">Debug</option><option value="info">Info</option><option value="warn">Warning</option><option value="error">Error</option></select></div>
                    <div className="flex items-center justify-between"><span className={labelClass}>Max Upload (MB)</span><input type="number" value={settings.system.maxUploadSize} onChange={e => updateSetting('system', 'maxUploadSize', parseInt(e.target.value))} className={`w-24 border rounded-lg px-3 py-1.5 ${inputClass}`} /></div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg border-2 border-red-300 ${darkMode ? 'bg-red-900/10' : 'bg-red-50'}`}>
                  <h3 className="font-medium mb-4 text-red-600"><AlertTriangle className="w-5 h-5 inline mr-2" />Danger Zone</h3>
                  <div className="flex gap-3">
                    <button onClick={handleClearCache} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Clear Cache</button>
                    <button onClick={handleClearLogs} className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800">Clear Logs</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;