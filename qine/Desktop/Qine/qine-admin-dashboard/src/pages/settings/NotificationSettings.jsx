// src/pages/settings/NotificationSettings.jsx
import { useState } from 'react';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    // Order Notifications
    newOrder: true,
    orderAccepted: true,
    orderReady: true,
    orderDelivered: true,
    
    // Inventory Notifications
    lowStock: true,
    outOfStock: true,
    stockRestocked: false,
    
    // Commission Notifications
    commissionEarned: true,
    commissionPaid: true,
    
    // Merchant Notifications
    merchantApproved: true,
    merchantRejected: true,
    newMerchant: true,
    
    // System Notifications
    systemUpdates: false,
    maintenance: true,
    
    // Delivery Notifications
    riderAssigned: true,
    riderArrived: false,
    deliveryStarted: true,
    deliveryCompleted: true,
    
    // Marketing
    promotions: false,
    newsletter: false
  });

  const [emailSettings, setEmailSettings] = useState({
    instant: true,
    daily: false,
    weekly: true,
    monthly: false
  });

  const handleSettingChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEmailSettingChange = (key) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    console.log('Saving notification settings:', { settings, emailSettings });
    // API call to save settings
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Order Notifications
            </h2>
            <div className="space-y-3">
              {Object.entries({
                newOrder: 'New Order Received',
                orderAccepted: 'Order Accepted',
                orderReady: 'Order Ready for Pickup',
                orderDelivered: 'Order Delivered'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{label}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => handleSettingChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Inventory Alerts
            </h2>
            <div className="space-y-3">
              {Object.entries({
                lowStock: 'Low Stock Alert (<10 items)',
                outOfStock: 'Out of Stock Alert',
                stockRestocked: 'Stock Restocked'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{label}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => handleSettingChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Commission Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Commission & Payments
            </h2>
            <div className="space-y-3">
              {Object.entries({
                commissionEarned: 'Commission Earned',
                commissionPaid: 'Commission Paid'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{label}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => handleSettingChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Email Frequency */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Email Digest</h2>
            <div className="space-y-3">
              {Object.entries({
                instant: 'Instant (Real-time)',
                daily: 'Daily Summary',
                weekly: 'Weekly Report',
                monthly: 'Monthly Report'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="radio"
                    name="emailFrequency"
                    checked={emailSettings[key]}
                    onChange={() => {
                      Object.keys(emailSettings).forEach(k => {
                        emailSettings[k] = false;
                      });
                      handleEmailSettingChange(key);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;