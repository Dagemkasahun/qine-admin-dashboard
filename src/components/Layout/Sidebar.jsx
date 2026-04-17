// src/components/Layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem("qine_token");
    localStorage.removeItem("qine_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const mainMenuItems = [
    { path: "/", icon: LayoutDashboard, key: "Dashboard" },
    { path: "/users", icon: Users, key: "Users" },
    { path: "/merchants", icon: Store, key: "Merchants" },
    { path: "/riders", icon: Bike, key: "Riders" },
    { path: "/admin/orders", icon: ShoppingBag, key: "Orders" },
    { path: "/payments", icon: CreditCard, key: "Payments" },
  ];

  const adminMenuItems = [
    { path: "/admin/approvals", icon: ClipboardCheck, key: "Approvals" },
    { path: "/admin/commission", icon: BarChart3, key: "Commission" },
  ];

  const bottomMenuItems = [
    { path: "/settings", icon: Settings, key: "Settings" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-20 h-screen w-64 flex flex-col
        ${darkMode
          ? "bg-gray-900 border-r border-gray-800 text-gray-100"
          : "bg-white border-r border-gray-200 text-gray-800"}
        shadow-xl
      `}
    >
      {/* Logo */}
      <div
        className={`
          h-16 flex items-center justify-center border-b
          ${darkMode ? "border-gray-800" : "border-gray-200"}
        `}
      >
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          QINE Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {/* Main Menu */}
        <div className="mb-4">
          <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
            Main
          </p>
          {mainMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 relative
                  ${active
                    ? darkMode
                      ? "bg-indigo-900/50 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span>{item.key}</span>
                {active && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Menu */}
        <div className="mb-4">
          <p className={`px-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
            Admin
          </p>
          {adminMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 relative
                  ${active
                    ? darkMode
                      ? "bg-indigo-900/50 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <item.icon className={`mr-3 w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span>{item.key}</span>
                {active && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={`px-3 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        {/* Settings Link */}
        <Link
          to="/settings"
          className={`
            group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium
            transition-all duration-200
            ${isActive("/settings")
              ? darkMode
                ? "bg-indigo-900/50 text-indigo-400"
                : "bg-indigo-50 text-indigo-700"
              : darkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          <Settings className={`mr-3 w-5 h-5 ${isActive("/settings") ? "text-indigo-600" : "text-gray-500"}`} />
          <span>Settings</span>
        </Link>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`
            w-full group flex items-center rounded-lg mb-1 px-3 py-2.5 text-sm font-medium
            transition-all duration-200
            ${darkMode
              ? "text-gray-300 hover:bg-gray-800 hover:text-white"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          {darkMode ? (
            <>
              <Sun className="mr-3 w-5 h-5 text-yellow-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="mr-3 w-5 h-5 text-gray-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full group flex items-center rounded-lg mt-2 px-3 py-2.5 text-sm font-medium
            transition-all duration-200
            ${darkMode
              ? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
              : "text-red-600 hover:bg-red-50 hover:text-red-700"
            }
          `}
        >
          <LogOut className="mr-3 w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;