// src/components/Layout/Layout.jsx
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6 bg-gray-50 min-h-screen mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;