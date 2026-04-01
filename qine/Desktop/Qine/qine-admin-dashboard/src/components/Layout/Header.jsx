// src/components/Layout/Header.jsx
import { Bell, User, Search } from 'lucide-react';
import NotificationCenter from '../NotificationCenter';
import { Toaster } from 'react-hot-toast';

const Header = () => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      {/* Toast Notifications Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 4000,
            icon: '❌',
          },
          loading: {
            duration: 3000,
            icon: '⏳',
          },
        }}
      />
      
      {/* Search Bar */}
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders, customers, products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>
      
      {/* Right Side Icons and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Center */}
        <NotificationCenter />
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Dagem K.</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            DK
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;