// src/components/NotificationCenter.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, ShoppingBag, Package, DollarSign, 
  CheckCircle, XCircle, AlertTriangle, 
  Clock, UserCheck, Store, Truck
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'inventory': return <Package className="w-5 h-5 text-yellow-500" />;
      case 'commission': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'approval': return <UserCheck className="w-5 h-5 text-purple-500" />;
      case 'delivery': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate based on notification type
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      
                      {/* Action buttons for specific notifications */}
                      {notification.type === 'order' && notification.status === 'pending' && (
                        <div className="mt-2 flex space-x-2">
                          <button className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                            Accept
                          </button>
                          <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                            Decline
                          </button>
                        </div>
                      )}
                      
                      {notification.type === 'inventory' && notification.stock < 10 && (
                        <div className="mt-2">
                          <Link 
                            to="/inventory"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Restock now →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50 rounded-b-lg">
              <Link
                to="/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;