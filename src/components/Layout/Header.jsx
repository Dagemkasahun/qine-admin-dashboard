// src/components/Layout/Header.jsx
import { Bell, User, KeyRound, LogOut, ChevronDown, Search, Moon, Sun } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/client";
import { io } from "socket.io-client";

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : "Admin";
  const userRole = user?.role?.replace('_', ' ') || "Admin";
  const userEmail = user?.email || "";

  // Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/users/${user.id}/notifications`)
        .then(res => {
          const data = res.data || [];
          setNotifications(data.map(n => ({
            id: n.id, text: n.message || n.title, read: n.isRead, time: getTimeAgo(n.createdAt), type: n.type,
          })));
        }).catch(() => {});
    }
  }, [user?.id]);

  // WebSocket for real-time
  useEffect(() => {
    const wsUrl = import.meta.env.DEV ? 'http://localhost:5002' : 'https://qine-backend.onrender.com';
    const socket = io(wsUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('joinAdminRoom'));
    socket.on('notification', (n) => {
      setNotifications(prev => [{ id: Date.now(), text: n.message || n.title, read: false, time: 'Just now', type: n.type }, ...prev]);
    });
    socket.on('newOrder', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `New order ${data.orderNumber} - ETB ${data.total}`, read: false, time: 'Just now', type: 'order' }, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setOpenNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'order': return '🛒';
      case 'merchant': return '🏪';
      case 'promotion': return '📣';
      case 'inventory': return '📦';
      case 'approval': return '✅';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const routeNames = {
    "": "Dashboard",
    users: "Users", merchants: "Merchants", riders: "Riders", orders: "Orders",
    payments: "Payments", settings: "Settings", approvals: "Approvals",
    commission: "Commission", promotions: "Promotions", "audit-logs": "Audit Logs",
    "live-map": "Live Map", profile: "Profile", security: "Security", admin: "Admin",
  };

  const pathnames = location.pathname.split("/").filter(Boolean);

  // Format breadcrumb with home link
  const breadcrumbs = pathnames.length === 0 
    ? [{ label: 'Dashboard', path: '/' }]
    : [
        { label: 'Home', path: '/' },
        ...pathnames.map((name, i) => ({
          label: routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1),
          path: '/' + pathnames.slice(0, i + 1).join('/'),
        }))
      ];

  return (
    <header 
      className={`fixed top-0 right-0 z-30 h-16 border-b transition-colors duration-200 ${
        darkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-gray-200"
      }`}
      style={{ left: '256px' }}
    >
      <div className="h-16 flex items-center justify-between px-6">
        {/* LEFT: Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {i === breadcrumbs.length - 1 ? (
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {crumb.label}
                </span>
              ) : (
                <button
                  onClick={() => navigate(crumb.path)}
                  className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isOnline 
              ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
              : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition ${
              darkMode ? "hover:bg-gray-800 text-yellow-400" : "hover:bg-gray-100 text-gray-500"
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setOpenNotifications(!openNotifications)}
              className={`p-2 rounded-lg transition relative ${
                darkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {openNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20">
                  <div>
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 text-xs text-indigo-600 font-medium">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline font-medium">
                        Read all
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button onClick={clearAll} className="text-xs text-red-500 hover:underline font-medium">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No notifications</p>
                      <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <div key={n.id}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`px-4 py-3 border-b dark:border-gray-700 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !n.read ? 'bg-blue-50/50 dark:bg-indigo-900/20 border-l-3 border-l-blue-500' : ''
                        }`}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getNotifIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                              {n.text}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className={`flex items-center gap-2 p-1.5 rounded-lg transition ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {userName.charAt(0).toUpperCase()}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-[11px] text-gray-400 capitalize">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {openProfile && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border z-50 overflow-hidden ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-gray-400">{userEmail}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {userRole}
                  </span>
                </div>
                <button onClick={() => { navigate('/profile'); setOpenProfile(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => { navigate('/security'); setOpenProfile(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <KeyRound size={16} /> Security
                </button>
                <button onClick={toggleDarkMode}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  {darkMode ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                </button>
                <div className="border-t dark:border-gray-700"></div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                  <LogOut size={16} /> Sign Out
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