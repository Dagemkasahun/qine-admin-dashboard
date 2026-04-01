// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Listen for new notifications
    newSocket.on('notification', (notification) => {
      addNotification(notification);
      
      // Show toast based on notification type
      switch (notification.type) {
        case 'order':
          toast.success(`New Order: ${notification.message}`);
          break;
        case 'inventory':
          toast.error(`Inventory Alert: ${notification.message}`);
          break;
        case 'commission':
          toast.success(`Commission: ${notification.message}`);
          break;
        case 'approval':
          toast.success(`Merchant: ${notification.message}`);
          break;
        default:
          toast(notification.message);
      }
    });

    // Listen for order updates
    newSocket.on('orderUpdate', (data) => {
      addNotification({
        id: Date.now(),
        type: 'order',
        title: 'Order Update',
        message: `Order #${data.orderNumber} is now ${data.status}`,
        timestamp: new Date(),
        read: false
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};