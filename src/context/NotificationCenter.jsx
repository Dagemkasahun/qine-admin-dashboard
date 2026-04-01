// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Correct place for the connection
    const newSocket = io(import.meta.env.VITE_WS_URL || 'https://qine-backend.onrender.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Listen for events
    newSocket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => newSocket.disconnect();
  }, []);

  // Helper functions
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);