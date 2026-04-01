// src/components/Layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Bike, 
  ShoppingBag,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  CheckCircle,
  DollarSign  // ← Add this missing import
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/merchants', icon: Store, label: 'Merchants' },
    { path: '/riders', icon: Bike, label: 'Riders' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/approvals', icon: CheckCircle, label: 'Approvals' },
    { path: '/admin/commissions', icon: DollarSign, label: 'Commissions' }, // ← Now this works
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        QINE Admin
      </div>
      
      <nav className="flex-1 mt-6 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 hover:bg-gray-800 transition
                ${isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center text-gray-400 hover:text-white transition w-full">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;