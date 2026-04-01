// src/components/Layout/Layout.jsx
import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ThemeContext } from "../../context/ThemeContext";

const Layout = ({ userRole }) => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={`${darkMode ? "bg-slate-950 text-white" : "bg-gray-100 text-gray-900"} min-h-screen flex`}>
      
      {/* Sidebar (fixed width) */}
      <Sidebar userRole={userRole} />

      {/* Main wrapper */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="flex-1 pt-16 px-6 w-full">
          {/* Full-width container; optionally limit max width */}
          <div className="w-full lg:max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;