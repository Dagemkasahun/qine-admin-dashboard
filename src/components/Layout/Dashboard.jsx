// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { 
  Users, Store, Bike, Package, DollarSign, 
  TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertCircle, Download, Calendar, Activity, CreditCard
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ThemeContext } from '../context/ThemeContext';

const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate API

      setStats({
        totalUsers: { value: 15420, change: 12.5, trend: 'up' },
        activeMerchants: { value: 38, change: 2.7, trend: 'up' },
        activeRiders: { value: 72, change: 6.4, trend: 'up' },
        totalOrders: { value: 3421, change: 18.2, trend: 'up' },
        revenue: { value: 456789, change: 22.4, trend: 'up' },
        avgDeliveryTime: { value: 32, unit: 'min', change: -4.5, trend: 'down' },
        onTimeDelivery: { value: 94.2, unit: '%', change: 1.8, trend: 'up' },
        avgRating: { value: 4.6, change: 0.2, trend: 'up' }
      });

      setCharts({
        revenueTrend: [
          { date: '2024-01-01', revenue: 45000 },
          { date: '2024-01-02', revenue: 52000 },
          { date: '2024-01-03', revenue: 48000 }
        ],
        ordersByStatus: [
          { name: 'Pending', value: 23, color: '#FBBF24' },
          { name: 'Delivered', value: 3128, color: '#34D399' }
        ],
        revenueByCategory: [
          { name: 'Food', value: 45 },
          { name: 'Groceries', value: 25 }
        ],
        hourlyOrders: [
          { hour: '6-9', orders: 45 },
          { hour: '9-12', orders: 120 }
        ]
      });

      setTopMerchants([
        { id: 1, name: 'Restaurant A', orders: 456, revenue: 56780, rating: 4.8 },
        { id: 2, name: 'Supermarket B', orders: 389, revenue: 45670, rating: 4.6 }
      ]);

      setRecentActivities([
        { id: 1, type: 'order', action: 'New order #1234', user: 'Abebe K.', time: '2 min ago', status: 'pending' },
        { id: 2, type: 'merchant', action: 'Merchant joined', user: 'Restaurant A', time: '15 min ago', status: 'success' }
      ]);

      setAlerts([
        { id: 1, type: 'warning', message: '8 orders pending for >30 min', time: '10 min ago' },
        { id: 2, type: 'info', message: '3 riders offline in peak hours', time: '25 min ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, trend, color, format = 'number' }) => (
    <div className={`rounded-xl shadow-sm p-6 hover:shadow-md transition ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">
        {format === 'currency' ? `ETB ${value.toLocaleString()}` : value.toLocaleString()}
        {value?.unit && <span className="text-sm text-gray-400 ml-1">{value.unit}</span>}
      </p>
    </div>
  );

  if (loading) {
    return <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-6 min-h-screen animate-pulse`}>Loading...</div>;
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center p-4 rounded-lg ${alert.type === 'warning' ? (darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-800') : (darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800')}`}>
                <AlertCircle className="w-5 h-5 mr-3" />
                <span className="flex-1">{alert.message}</span>
                <span className="text-sm opacity-75">{alert.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers?.value} icon={Users} change={stats.totalUsers?.change} trend={stats.totalUsers?.trend} color="bg-blue-500" />
          <StatCard title="Active Merchants" value={stats.activeMerchants?.value} icon={Store} change={stats.activeMerchants?.change} trend={stats.activeMerchants?.trend} color="bg-green-500" />
          <StatCard title="Active Riders" value={stats.activeRiders?.value} icon={Bike} change={stats.activeRiders?.change} trend={stats.activeRiders?.trend} color="bg-purple-500" />
          <StatCard title="Total Orders" value={stats.totalOrders?.value} icon={Package} change={stats.totalOrders?.change} trend={stats.totalOrders?.trend} color="bg-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;