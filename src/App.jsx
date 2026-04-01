// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Merchants from "./pages/Merchants";
import AddMerchant from "./pages/AddMerchant";
import MerchantPage from "./pages/MerchantPage"; // Parent Layout for Merchant
import MerchantDashboard from "./pages/merchant/MerchantDashboard"; // The 4 Cards
import ProductManagement from "./pages/merchant/ProductManagement";
import InventoryManagement from "./pages/merchant/InventoryManagement";
import OrderManagement from "./pages/merchant/OrderManagement";
import SalesAnalytics from "./pages/merchant/SalesAnalytics";

import Riders from "./pages/Riders";
import RiderDetails from "./pages/RidersDetails";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import AssignRider from "./pages/AssignRider";
import Profile from "./pages/Profile";
import Security from "./pages/Security";

import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [riders, setRiders] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("riders");
    setRiders(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    if (riders) localStorage.setItem("riders", JSON.stringify(riders));
  }, [riders]);

  if (riders === null) return null;

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Riders */}
            <Route
              path="riders"
              element={<Riders riders={riders} setRiders={setRiders} />}
            />
            <Route
              path="riders/:id"
              element={<RiderDetails riders={riders} setRiders={setRiders} />}
            />

            {/* Users & Merchants */}
            <Route path="users" element={<Users />} />
            <Route path="merchants" element={<Merchants />} />
            <Route path="merchants/add" element={<AddMerchant />} />
            
            {/* --- NESTED MERCHANT ROUTES --- */}
            <Route path="merchant/:merchantId" element={<MerchantPage />}>
              {/* Default view: The 4 Management Module cards */}
              <Route index element={<MerchantDashboard />} /> 
              
              {/* Sub-modules */}
              <Route path="products" element={<ProductManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="analytics" element={<SalesAnalytics />} />
              <Route path="staff" element={<div>Staff Management Coming Soon</div>} />
            </Route>

            {/* Admin Orders, Payments, Reports */}
            <Route path="orders" element={<Orders riders={riders} />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assign-rider" element={<AssignRider />} />

            {/* Settings */}
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />

            <Route path="settings/profile" element={<Navigate to="/profile" replace />} />
            <Route path="settings/security" element={<Navigate to="/security" replace />} />

            <Route path="/merchant/:merchantId" element={<MerchantPage />}>
  
  
</Route>
          </Route>
        </Routes>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;