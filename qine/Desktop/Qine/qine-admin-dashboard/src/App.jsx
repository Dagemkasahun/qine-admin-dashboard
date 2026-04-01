// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Merchants from "./pages/Merchants";
import AddMerchant from "./pages/AddMerchant";
import MerchantPage from "./pages/MerchantPage";
import Riders from "./pages/Riders";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MerchantRegistration from './pages/MerchantRegistration';
import MerchantApprovals from './pages/admin/MerchantApprovals';
import ProductManagement from './pages/merchant/ProductManagement';
import MenuManagement from './pages/merchant/MenuManagement';
import ServiceManagement from './pages/merchant/ServiceManagement';
import InventoryManagement from './pages/merchant/InventoryManagement';
import OrderManagement from './pages/merchant/OrderManagement';
import SalesReports from './pages/merchant/SalesReports';
import CommissionManagement from './pages/admin/CommissionManagement';
import { NotificationProvider } from './context/NotificationContext';
import NotificationSettings from './pages/settings/NotificationSettings';
import TestAPI from "./pages/TestAPI";  // ← Add this import


function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="merchants/add" element={<AddMerchant />} />
          <Route path="merchant/:merchantId" element={<MerchantPage />} />
          <Route path="riders" element={<Riders />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="merchant/register" element={<MerchantRegistration />} />
          <Route path="admin/approvals" element={<MerchantApprovals />} />
          <Route path="merchant/:merchantId/products" element={<ProductManagement />} />
          <Route path="merchant/:merchantId/menu" element={<MenuManagement />} />
          <Route path="merchant/:merchantId/services" element={<ServiceManagement />} />
          <Route path="merchant/:merchantId/inventory" element={<InventoryManagement />} />
          <Route path="merchant/:merchantId/orders" element={<OrderManagement />} />
          <Route path="merchant/:merchantId/reports" element={<SalesReports />} />
          <Route path="admin/commissions" element={<CommissionManagement />} />
          <Route path="settings/notifications" element={<NotificationSettings />} />
          <Route path="/test-api" element={<TestAPI />} />
		</Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;