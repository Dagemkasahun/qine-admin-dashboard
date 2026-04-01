// pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  Users, Store, Bike, Package, DollarSign, 
  TrendingUp, TrendingDown, Clock, CheckCircle,
  XCircle, AlertCircle, Download, Calendar,
  Eye, ShoppingBag, CreditCard, Activity
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
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

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - Replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        // Key Metrics
        totalUsers: { value: 15420, change: 12.5, trend: 'up' },
        activeUsers: { value: 8234, change: 8.3, trend: 'up' },
        totalMerchants: { value: 41, change: 5, trend: 'up' },
        activeMerchants: { value: 38, change: 2.7, trend: 'up' },
        totalRiders: { value: 89, change: 15.2, trend: 'up' },
        activeRiders: { value: 72, change: 6.4, trend: 'up' },
        
        // Order Metrics
        totalOrders: { value: 3421, change: 18.2, trend: 'up' },
        pendingOrders: { value: 23, change: -5.3, trend: 'down' },
        completedOrders: { value: 3128, change: 20.1, trend: 'up' },
        cancelledOrders: { value: 270, change: 2.1, trend: 'up' },
        
        // Financial Metrics
        revenue: { value: 456789, change: 22.4, trend: 'up' },
        averageOrderValue: { value: 134, change: 3.2, trend: 'up' },
        commission: { value: 45679, change: 22.4, trend: 'up' },
        payoutPending: { value: 15678, change: 8.7, trend: 'up' },
        
        // Delivery Metrics
        avgDeliveryTime: { value: 32, unit: 'min', change: -4.5, trend: 'down' },
        onTimeDelivery: { value: 94.2, unit: '%', change: 1.8, trend: 'up' },
        deliveryDistance: { value: 1245, unit: 'km', change: 15.3, trend: 'up' },
        
        // Satisfaction
        avgRating: { value: 4.6, change: 0.2, trend: 'up' },
        complaints: { value: 12, change: -2, trend: 'down' }
      });

      setCharts({
        revenueTrend: [
          { date: '2024-01-01', revenue: 45000, orders: 320 },
          { date: '2024-01-02', revenue: 52000, orders: 380 },
          { date: '2024-01-03', revenue: 48000, orders: 350 },
          { date: '2024-01-04', revenue: 61000, orders: 440 },
          { date: '2024-01-05', revenue: 58000, orders: 420 },
          { date: '2024-01-06', revenue: 63000, orders: 460 },
          { date: '2024-01-07', revenue: 67000, orders: 490 },
          { date: '2024-01-08', revenue: 59000, orders: 430 },
          { date: '2024-01-09', revenue: 64000, orders: 470 },
          { date: '2024-01-10', revenue: 72000, orders: 520 }
        ],
        ordersByStatus: [
          { name: 'Pending', value: 23, color: '#FBBF24' },
          { name: 'Assigned', value: 45, color: '#60A5FA' },
          { name: 'Picked Up', value: 38, color: '#8B5CF6' },
          { name: 'In Transit', value: 52, color: '#EC4899' },
          { name: 'Delivered', value: 3128, color: '#34D399' },
          { name: 'Cancelled', value: 270, color: '#F87171' }
        ],
        revenueByCategory: [
          { name: 'Food', value: 45 },
          { name: 'Groceries', value: 25 },
          { name: 'Pharmacy', value: 15 },
          { name: 'Retail', value: 10 },
          { name: 'Others', value: 5 }
        ],
        hourlyOrders: [
          { hour: '6-9', orders: 45 },
          { hour: '9-12', orders: 120 },
          { hour: '12-15', orders: 280 },
          { hour: '15-18', orders: 210 },
          { hour: '18-21', orders: 320 },
          { hour: '21-24', orders: 180 },
          { hour: '0-6', orders: 30 }
        ]
      });

      setTopMerchants([
        { id: 1, name: 'Restaurant A', orders: 456, revenue: 56780, rating: 4.8 },
        { id: 2, name: 'Supermarket B', orders: 389, revenue: 45670, rating: 4.6 },
        { id: 3, name: 'Pharmacy C', orders: 312, revenue: 38900, rating: 4.9 },
        { id: 4, name: 'Restaurant D', orders: 298, revenue: 34560, rating: 4.5 },
        { id: 5, name: 'Store E', orders: 245, revenue: 28900, rating: 4.7 }
      ]);

      setRecentActivities([
        { id: 1, type: 'order', action: 'New order #1234', user: 'Abebe K.', time: '2 min ago', status: 'pending' },
        { id: 2, type: 'merchant', action: 'Merchant joined', user: 'Restaurant A', time: '15 min ago', status: 'success' },
        { id: 3, type: 'rider', action: 'Rider completed delivery', user: 'Getachew T.', time: '25 min ago', status: 'success' },
        { id: 4, type: 'payment', action: 'Payment issue', user: 'Order #1230', time: '1 hour ago', status: 'error' },
        { id: 5, type: 'user', action: 'New user registered', user: 'Sara H.', time: '2 hours ago', status: 'success' }
      ]);

      setAlerts([
        { id: 1, type: 'warning', message: '8 orders pending for >30 min', time: '10 min ago' },
        { id: 2, type: 'info', message: '3 riders offline in peak hours', time: '25 min ago' },
        { id: 3, type: 'critical', message: 'Payment gateway slow response', time: '1 hour ago' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, trend, color, format = 'number' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">
        {format === 'currency' ? `ETB ${value.toLocaleString()}` : 
         format === 'percentage' ? `${value}%` :
         value.toLocaleString()}
        {value.unit && <span className="text-sm text-gray-500 ml-1">{value.unit}</span>}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="animate-pulse bg-gray-200 h-10 w-64 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Date Range */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center bg-white rounded-lg shadow-sm p-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <DatePicker
              selectsRange={true}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={(update) => {
                setDateRange({ startDate: update[0], endDate: update[1] });
              }}
              className="border-none focus:outline-none text-sm"
              placeholderText="Select date range"
            />
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className={`flex items-center p-4 rounded-lg ${
              alert.type === 'critical' ? 'bg-red-50 text-red-800' :
              alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              <AlertCircle className="w-5 h-5 mr-3" />
              <span className="flex-1">{alert.message}</span>
              <span className="text-sm opacity-75">{alert.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers?.value} 
          icon={Users}
          change={stats.totalUsers?.change}
          trend={stats.totalUsers?.trend}
          color="bg-blue-500"
        />
        <StatCard 
          title="Active Merchants" 
          value={stats.activeMerchants?.value} 
          icon={Store}
          change={stats.activeMerchants?.change}
          trend={stats.activeMerchants?.trend}
          color="bg-green-500"
        />
        <StatCard 
          title="Active Riders" 
          value={stats.activeRiders?.value} 
          icon={Bike}
          change={stats.activeRiders?.change}
          trend={stats.activeRiders?.trend}
          color="bg-purple-500"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders?.value} 
          icon={Package}
          change={stats.totalOrders?.change}
          trend={stats.totalOrders?.trend}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Revenue" 
          value={stats.revenue?.value} 
          icon={DollarSign}
          change={stats.revenue?.change}
          trend={stats.revenue?.trend}
          color="bg-red-500"
          format="currency"
        />
        <StatCard 
          title="Avg. Delivery Time" 
          value={stats.avgDeliveryTime?.value}
          icon={Clock}
          change={stats.avgDeliveryTime?.change}
          trend={stats.avgDeliveryTime?.trend}
          color="bg-indigo-500"
        />
        <StatCard 
          title="On-Time Delivery" 
          value={stats.onTimeDelivery?.value}
          icon={CheckCircle}
          change={stats.onTimeDelivery?.change}
          trend={stats.onTimeDelivery?.trend}
          color="bg-teal-500"
          format="percentage"
        />
        <StatCard 
          title="Avg Rating" 
          value={stats.avgRating?.value}
          icon={Activity}
          change={stats.avgRating?.change}
          trend={stats.avgRating?.trend}
          color="bg-pink-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Trend</h2>
            <select className="text-sm border rounded-lg px-3 py-1">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={charts.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#93C5FD" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.ordersByStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Hourly Order Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.revenueByCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section - Top Merchants and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Merchants</h2>
          <div className="space-y-4">
            {topMerchants.map(merchant => (
              <div key={merchant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Store className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="mr-3">{merchant.orders} orders</span>
                      <span>ETB {merchant.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{merchant.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Merchants →
          </button>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center">
                  {activity.type === 'order' && <Package className="w-4 h-4 text-blue-500 mr-3" />}
                  {activity.type === 'merchant' && <Store className="w-4 h-4 text-green-500 mr-3" />}
                  {activity.type === 'rider' && <Bike className="w-4 h-4 text-purple-500 mr-3" />}
                  {activity.type === 'user' && <Users className="w-4 h-4 text-yellow-500 mr-3" />}
                  {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-red-500 mr-3" />}
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-gray-600"> by {activity.user}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
                {activity.status === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                )}
                {activity.status === 'error' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Error</span>
                )}
                {activity.status === 'success' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Success</span>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Activities →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;