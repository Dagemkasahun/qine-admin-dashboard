// src/components/Layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  ShoppingBag,
  CreditCard,
} from "lucide-react"; // ❌ removed Settings icon
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";

const Sidebar = () => {
  const location = useLocation();
  const { darkMode } = useContext(ThemeContext);

  const menuItems = [
    { path: "/", icon: LayoutDashboard, key: "Dashboard" },
    { path: "/users", icon: Users, key: "Users" },
    { path: "/merchants", icon: Store, key: "Merchants" },
    { path: "/riders", icon: Bike, key: "Riders" },
    { path: "/orders", icon: ShoppingBag, key: "Orders" },
    { path: "/payments", icon: CreditCard, key: "Payments" },
    // ❌ Settings removed completely
  ];

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
        <span className="text-xl font-bold tracking-tight">
          QINE Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center rounded-lg mb-1.5 px-3 py-2.5 text-sm font-medium
                transition-all duration-200 relative
                ${
                  isActive
                    ? darkMode
                      ? "bg-gray-800 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800/70 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 w-5 h-5
                  ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-indigo-600"
                  }
                `}
              />

              <span>{item.key}</span>

              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600 rounded-r-lg"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;