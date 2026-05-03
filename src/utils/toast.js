// src/utils/toast.js
import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message, { 
    icon: '✅',
    style: { borderLeft: '4px solid #10b981' }
  }),
  
  error: (message) => toast.error(message, {
    icon: '❌',
    style: { borderLeft: '4px solid #ef4444' }
  }),
  
  warning: (message) => toast(message, {
    icon: '⚠️',
    style: { borderLeft: '4px solid #f59e0b' }
  }),
  
  info: (message) => toast(message, {
    icon: 'ℹ️',
    style: { borderLeft: '4px solid #3b82f6' }
  }),
  
  promise: (promise, messages) => toast.promise(promise, {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success!',
    error: messages.error || 'Error occurred',
  }),
};