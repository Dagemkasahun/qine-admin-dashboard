// src/App.jsx - FIXED VERSION
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// UI Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import LiveMap from './pages/LiveMap';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Merchants from './pages/Merchants';
import AddMerchant from './pages/AddMerchant';
import MerchantPage from './pages/MerchantPage';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import ProductManagement from './pages/merchant/ProductManagement';
import InventoryManagement from './pages/merchant/InventoryManagement';
import OrderManagement from './pages/merchant/OrderManagement';
import SalesAnalytics from './pages/merchant/SalesAnalytics';
import CompanyProfile from './pages/merchant/CompanyProfile';
import Riders from './pages/Riders';
import RiderDetails from "./pages/RidersDetails";
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Security from './pages/Security';
import SettingsPage from './pages/SettingsPage';
import PendingApprovals from "./pages/Admin/PendingApprovals";
import CommissionManagement from "./pages/Admin/CommissionManagement";
import AuditLogs from './pages/AuditLogs';
import Promotions from './pages/Promotions';

// Wrapper component to handle auth loading
const AppContent = () => {
  const { loading, user } = useAuth();
  const [riders, setRiders] = useState(null);

  useKeyboardShortcuts();

  useEffect(() => {
    const saved = localStorage.getItem('riders');
    setRiders(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    if (riders !== null) {
      localStorage.setItem('riders', JSON.stringify(riders));
    }
  }, [riders]);

  if (loading || riders === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading QINE Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">401</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Unauthorized Access</p>
              <a href="/" className="text-blue-600 hover:underline">Go to Dashboard</a>
            </div>
          </div>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />

          {/* Admin Routes */}
          <Route path="admin">
            <Route path="approvals" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <PendingApprovals />
              </ProtectedRoute>
            } />
            <Route path="commission" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <CommissionManagement />
              </ProtectedRoute>
            } />
            <Route path="orders" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <Orders riders={riders} />
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                <SalesAnalytics />
              </ProtectedRoute>
            } />
          </Route>

          {/* Users */}
          <Route path="users" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Users />
            </ProtectedRoute>
          } />

          {/* Riders */}
          <Route path="riders" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Riders riders={riders} setRiders={setRiders} />
            </ProtectedRoute>
          } />
          <Route path="riders/:id" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <RiderDetails riders={riders} setRiders={setRiders} />
            </ProtectedRoute>
          } />

          {/* Merchants */}
          <Route path="merchants" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Merchants />
            </ProtectedRoute>
          } />
          <Route path="merchants/add" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <AddMerchant />
            </ProtectedRoute>
          } />

          {/* Orders */}
          <Route path="orders" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Orders riders={riders} />
            </ProtectedRoute>
          } />

          {/* Promotions - AT TOP LEVEL, NOT inside merchant portal */}
          <Route path="promotions" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Promotions />
            </ProtectedRoute>
          } />

          {/* Audit Logs - AT TOP LEVEL */}
          <Route path="audit-logs" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          {/* Merchant Portal */}
          <Route path="merchant/:merchantId" element={
            <ProtectedRoute roles={['MERCHANT', 'ADMIN', 'SUPER_ADMIN']}>
              <MerchantPage />
            </ProtectedRoute>
          }>
            <Route index element={<MerchantDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<SalesAnalytics />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="staff" element={<div className="p-6">Staff Management Coming Soon</div>} />
          </Route>

          {/* Payments */}
          <Route path="payments" element={
            <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
              <Payments />
            </ProtectedRoute>
          } />

          {/* Settings & Profile */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="security" element={<Security />} />

          {/* Redirects */}
          <Route path="settings/profile" element={<Navigate to="/profile" replace />} />
          <Route path="settings/security" element={<Navigate to="/security" replace />} />
          <Route path="reports" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="assign-rider" element={<Navigate to="/riders" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Unmatched routes */}
        <Route path="*" element={
          user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } />
		{/* map */}
		<Route path="live-map" element={
  <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
    <LiveMap />
  </ProtectedRoute>
} />
      </Routes>
    </ErrorBoundary>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider />
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;