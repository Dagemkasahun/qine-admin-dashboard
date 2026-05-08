// src/components/Layout/Sidebar.jsx - ROLE-BASED ACCESS
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Bike, ShoppingBag,
  CreditCard, Settings, BarChart3, ClipboardCheck,
  FileText, User, Megaphone, MapPin, Package,
  LogOut, Sun, Moon, Shield, AlertTriangle
} from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext";
import logoImage from "../../assets/icon.png";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const userRole = user?.role || 'ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
  const isMerchant = userRole === 'MERCHANT';

  // ===== MERCHANT MENU =====
  const merchantMenuItems = [
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}`, icon: LayoutDashboard, key: "Dashboard" },
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}/products`, icon: Package, key: "Products" },
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}/inventory`, icon: BarChart3, key: "Inventory" },
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}/orders`, icon: ShoppingBag, key: "Orders" },
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}/analytics`, icon: BarChart3, key: "Analytics" },
    { path: `/merchant/${user?.merchant?.id || 'dashboard'}/company`, icon: Store, key: "Company" },
  ];

  // ===== ADMIN/SUPER_ADMIN MAIN MENU =====
  const mainMenuItems = [
    { path: "/", icon: LayoutDashboard, key: "Dashboard" },
    { path: "/users", icon: Users, key: "Users" },
    { path: "/merchants", icon: Store, key: "Merchants" },
    { path: "/riders", icon: Bike, key: "Riders" },
    { path: "/orders", icon: ShoppingBag, key: "Orders" },
    { path: "/payments", icon: CreditCard, key: "Payments" },
    { path: "/reports", icon: BarChart3, key: "Reports" },
    { path: "/live-map", icon: MapPin, key: "Live Map" },
  ];

  // ===== MARKETING (Admin + Super Admin) =====
  const promotionsMenuItems = [
    { path: "/promotions", icon: Megaphone, key: "Promotions" },
  ];

  // ===== SUPER ADMIN ONLY =====
  const superAdminMenuItems = [
    { path: "/admin/approvals", icon: ClipboardCheck, key: "Approvals" },
    { path: "/admin/commission", icon: BarChart3, key: "Commission" },
    { path: "/audit-logs", icon: FileText, key: "Audit Logs" },
    { path: "/settings", icon: Settings, key: "Settings" },
  ];

  // ===== ACCOUNT (All Users) =====
  const accountMenuItems = [
    { path: "/profile", icon: User, key: "My Profile" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-20 h-screen w-64 flex flex-col
        ${darkMode ? "bg-gray-900 border-r border-gray-800 text-gray-100" : "bg-white border-r border-gray-200 text-gray-800"}
        shadow-xl
      `}
    >
      {/* Logo Section */}
      <div className={`h-16 flex items-center gap-3 px-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        {logoImage ? (
          <img src={logoImage} alt="QINE" className="w-9 h-9 rounded-lg object-contain"
            onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
        )}
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">QINE</span>
          <span className={`text-[10px] block -mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Merchant'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        
        {/* ===== MERCHANT VIEW ===== */}
        {isMerchant && (
          <div className="mb-4">
            <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
              Store Management
            </p>
            {merchantMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className={`group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                      : darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}>
                  <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                  <span>{item.key}</span>
                  {active && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>}
                </Link>
              );
            })}
          </div>
        )}

        {/* ===== ADMIN VIEW ===== */}
        {isAdmin && (
          <>
            {/* Main Menu */}
            <div className="mb-4">
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Main</p>
              {mainMenuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path}
                    className={`group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                        : darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}>
                    <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                    <span>{item.key}</span>
                    {active && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>}
                  </Link>
                );
              })}
            </div>

            {/* Marketing */}
            <div className="mb-4">
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Marketing</p>
              {promotionsMenuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path}
                    className={`group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                        : darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}>
                    <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                    <span>{item.key}</span>
                    {active && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* ===== SUPER ADMIN ONLY ===== */}
        {isSuperAdmin && (
          <div className="mb-4">
            <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
              <Shield className="w-3 h-3 inline mr-1" /> Super Admin
            </p>
            {superAdminMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className={`group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                    active
                      ? darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                      : darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}>
                  <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                  <span>{item.key}</span>
                  {active && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>}
                </Link>
              );
            })}
          </div>
        )}

        {/* ===== ACCOUNT (All Users) ===== */}
        <div>
          <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Account</p>
          {accountMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                    : darkMode ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}>
                <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span>{item.key}</span>
                {active && <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-3 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <button onClick={handleLogout}
          className={`w-full group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            darkMode ? "text-red-400 hover:bg-red-900/30 hover:text-red-300" : "text-red-600 hover:bg-red-50 hover:text-red-700"
          }`}>
          <LogOut className="mr-3 w-5 h-5" /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;