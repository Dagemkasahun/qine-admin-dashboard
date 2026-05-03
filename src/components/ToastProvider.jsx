// src/components/ToastProvider.jsx
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ToastProvider = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: darkMode ? '#1f2937' : '#fff',
          color: darkMode ? '#f9fafb' : '#1f2937',
          border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: darkMode ? '#064e3b' : '#ecfdf5',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: darkMode ? '#450a0a' : '#fef2f2',
          },
        },
      }}
    />
  );
};

export default ToastProvider;