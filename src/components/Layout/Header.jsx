
// src/components/Layout/Header.jsx
import { ChevronDown, Bell, User, KeyRound, LogOut } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const profileRef = useRef();
  const notificationsRef = useRef();

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New order received", read: false },
    { id: 2, text: "Payment pending from CBE", read: false },
    { id: 3, text: "New rider added", read: true },
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

  const routeNames = {
    profile: "Profile",
    security: "Change Password",
    users: "Users",
    merchants: "Merchants",
    merchant: "Merchant",
    riders: "Riders",
    orders: "Orders",
    payments: "Payments",
    reports: "Reports",
    dashboard: "Dashboard",
    "assign-rider": "Assign Rider",
  };

  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <header className={`fixed top-0 z-30 h-16 w-full border-b ${
      darkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white text-gray-900 border-gray-200"
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Breadcrumb / Page Title */}
        <div className="flex items-center flex-1 gap-2">
          {pathnames.length === 0 ? (
            <span className="text-[20px] font-semibold tracking-tight">Dashboard</span>
          ) : (
            pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              const displayName = routeNames[name] || name.replace("-", " ");
              const isLast = index === pathnames.length - 1;

              return (
                <span key={index} className="flex items-center gap-2">
                  {index !== 0 && <span className="text-gray-400 text-lg">/</span>}
                  <button
                    onClick={() => navigate(routeTo)}
                    className={`capitalize text-[28px] font-semibold tracking-tight transition ${
                      isLast ? "cursor-default" : darkMode ? "hover:text-indigo-400" : "hover:text-indigo-600"
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

        {/* RIGHT: Notifications / Theme / Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setOpenNotifications(!openNotifications)}
              className={`relative p-2 rounded-xl transition ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <Bell className="w-5 h-5" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {openNotifications && (
              <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-xl overflow-hidden border ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold">
                  Notifications
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition ${
                          !n.read ? "font-semibold" : ""
                        } hover:bg-gray-100 dark:hover:bg-gray-700`}
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((notif) =>
                              notif.id === n.id ? { ...notif, read: true } : notif
                            )
                          )
                        }
                      >
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setOpenProfile(!openProfile)} className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {openProfile && (
              <div className={`absolute right-0 mt-3 w-72 rounded-2xl shadow-xl overflow-hidden border ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-lg">{userName}</p>
                  <p className="text-sm text-gray-500">{userRole}</p>
                </div>
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <User className="w-4 h-4 text-purple-600" /> My Profile
                </button>
                <button
                  onClick={handleSecurity}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <KeyRound className="w-4 h-4 text-yellow-500" /> Change Password & Email
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
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