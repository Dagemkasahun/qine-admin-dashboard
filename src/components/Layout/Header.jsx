// src/components/Layout/Header.jsx
import { ChevronDown, Bell, User, KeyRound, LogOut } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { darkMode } = useContext(ThemeContext); // Removed toggleTheme since it's in sidebar now
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const profileRef = useRef();
  const notificationsRef = useRef();

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order received from Abebe K.", read: false, time: "5 min ago" },
    { id: 2, text: "Payment pending from CBE", read: false, time: "15 min ago" },
    { id: 3, text: "New merchant registration", read: false, time: "1 hour ago" },
    { id: 4, text: "Low stock alert: White Honey", read: true, time: "2 hours ago" },
  ]);

  let user = { name: "Admin", role: "admin", avatar: null };
  try {
    const storedUser = JSON.parse(localStorage.getItem("qine_user"));
    if (storedUser) user = storedUser;
  } catch (e) {}

  const userName = user.name || "Admin";
  const userRole = user.role || "admin";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("qine_token");
    localStorage.removeItem("qine_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    navigate("/profile");
    setOpenProfile(false);
  };

  const handleSecurity = () => {
    navigate("/security");
    setOpenProfile(false);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const routeNames = {
    profile: "Profile",
    security: "Security",
    users: "Users",
    merchants: "Merchants",
    merchant: "Merchant",
    riders: "Riders",
    orders: "Orders",
    payments: "Payments",
    reports: "Reports",
    dashboard: "Dashboard",
    settings: "Settings",
    approvals: "Approvals",
    commission: "Commission",
  };

  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <header className={`fixed top-0 z-30 h-16 w-full border-b ${
      darkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-gray-200"
    }`}>
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Breadcrumb */}
        <div className="flex items-center flex-1 gap-2">
          {pathnames.length === 0 ? (
            <span className="text-xl font-semibold tracking-tight">Dashboard</span>
          ) : (
            pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              const displayName = routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1);
              const isLast = index === pathnames.length - 1;

              return (
                <span key={index} className="flex items-center gap-2">
                  {index !== 0 && <span className="text-gray-400 text-lg">/</span>}
                  <button
                    onClick={() => !isLast && navigate(routeTo)}
                    className={`capitalize text-lg font-medium transition ${
                      isLast 
                        ? darkMode ? "text-white" : "text-gray-900"
                        : darkMode ? "text-gray-400 hover:text-indigo-400" : "text-gray-500 hover:text-indigo-600"
                    }`}
                    disabled={isLast}
                  >
                    {displayName}
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* RIGHT: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setOpenNotifications(!openNotifications)}
              className={`relative p-2 rounded-lg transition ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {openNotifications && (
              <div className={`absolute right-0 mt-3 w-80 rounded-xl shadow-xl overflow-hidden border ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700 cursor-pointer transition ${
                          !n.read 
                            ? darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'
                            : ''
                        } hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setOpenProfile(!openProfile)} 
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {openProfile && (
              <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl overflow-hidden border ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                </div>
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <User className="w-4 h-4 text-indigo-600" /> My Profile
                </button>
                <button
                  onClick={handleSecurity}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <KeyRound className="w-4 h-4 text-yellow-500" /> Security
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;