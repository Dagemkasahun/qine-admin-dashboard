// src/pages/merchant/SalesReports.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Download, Filter, PieChart, BarChart3,
  Package, ShoppingBag, Users, Clock,
  ChevronDown, Download as ExportIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SalesReports = () => {
  const { merchantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [reportType, setReportType] = useState('sales');
  const [viewMode, setViewMode] = useState('daily');

  // Mock data - replace with API calls
  const [salesData, setSalesData] = useState({
    summary: {
      totalRevenue: 456789,
      totalOrders: 1245,
      averageOrderValue: 367,
      totalProducts: 89,
      topSellingProducts: [
        { name: 'White Honey - 500g', quantity: 234, revenue: 81900 },
        { name: 'Forest Honey - 1kg', quantity: 156, revenue: 93600 },
        { name: 'Bee Wax - 250g', quantity: 98, revenue: 19600 },
        { name: 'Notebook A4', quantity: 87, revenue: 7395 },
        { name: 'Pen Pack', quantity: 76, revenue: 9120 }
      ],
      dailyRevenue: [
        { date: '2024-03-01', revenue: 12500, orders: 34 },
        { date: '2024-03-02', revenue: 14800, orders: 42 },
        { date: '2024-03-03', revenue: 11200, orders: 31 },
        { date: '2024-03-04', revenue: 16700, orders: 45 },
        { date: '2024-03-05', revenue: 18900, orders: 52 },
        { date: '2024-03-06', revenue: 15400, orders: 43 },
        { date: '2024-03-07', revenue: 17200, orders: 48 }
      ],
      categoryBreakdown: [
        { name: 'Honey', value: 45 },
        { name: 'Wax', value: 25 },
        { name: 'Stationary', value: 30 }
      ],
      hourlyOrders: [
        { hour: '6-9', orders: 45 },
        { hour: '9-12', orders: 120 },
        { hour: '12-15', orders: 280 },
        { hour: '15-18', orders: 210 },
        { hour: '18-21', orders: 320 },
        { hour: '21-24', orders: 180 }
      ]
    }
  });

  useEffect(() => {
    fetchSalesData();
  }, [merchantId, dateRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExport = (format) => {
    console.log(`Exporting as ${format}...`);
    // Implement export logic
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous) return { value: 0, trend: 'neutral' };
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral'
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sales Reports</h1>
          <p className="text-gray-600 mt-1">Track your business performance and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <ExportIcon className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          <div className="flex items-center space-x-2">
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <span>to</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Today</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">This Week</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">This Month</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">This Year</button>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 font-medium ${
              reportType === 'sales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sales Overview
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`px-4 py-2 font-medium ${
              reportType === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Product Performance
          </button>
          <button
            onClick={() => setReportType('analytics')}
            className={`px-4 py-2 font-medium ${
              reportType === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Advanced Analytics
          </button>
        </div>
      </div>

      {/* Sales Overview */}
      {reportType === 'sales' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5%
                </span>
              </div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(salesData.summary.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">vs last period</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.3%
                </span>
              </div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{salesData.summary.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-2">{salesData.summary.totalOrders - 120} more</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.2%
                </span>
              </div>
              <p className="text-gray-600 text-sm">Avg. Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(salesData.summary.averageOrderValue)}</p>
              <p className="text-xs text-gray-500 mt-2">ETB 15 increase</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15%
                </span>
              </div>
              <p className="text-gray-600 text-sm">Products Sold</p>
              <p className="text-2xl font-bold">{salesData.summary.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-2">12 new products</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-end mb-4">
            <div className="bg-white rounded-lg shadow inline-flex">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-l-lg ${
                  viewMode === 'daily' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-4 py-2 border-l ${
                  viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 border-l rounded-r-lg ${
                  viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={salesData.summary.dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Orders</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.summary.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10B981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={salesData.summary.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesData.summary.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Product Performance */}
      {reportType === 'products' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Quantity Sold</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Revenue</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {salesData.summary.topSellingProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.quantity}</td>
                  <td className="py-3 px-4">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 px-4">
                    {((product.revenue / salesData.summary.totalRevenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hourly Orders Chart */}
          <h2 className="text-lg font-semibold mt-8 mb-4">Peak Hours</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.summary.hourlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8B5CF6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Advanced Analytics */}
      {reportType === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Acquisition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Acquisition</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New Customers</span>
                  <span className="font-medium">245</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Returning Customers</span>
                  <span className="font-medium">128</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Customer Retention Rate</p>
                <p className="text-2xl font-bold text-green-600">68%</p>
              </div>
            </div>
          </div>

          {/* Order Value Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Value Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ETB 0-100</span>
                  <span className="font-medium">156 orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ETB 100-300</span>
                  <span className="font-medium">342 orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ETB 300-500</span>
                  <span className="font-medium">287 orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ETB 500+</span>
                  <span className="font-medium">98 orders</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">3.2%</p>
                <p className="text-xs text-green-600">+0.5%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg. Delivery Time</p>
                <p className="text-2xl font-bold text-green-600">32 min</p>
                <p className="text-xs text-green-600">-4 min</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold text-yellow-600">4.6 ★</p>
                <p className="text-xs text-green-600">+0.2</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReports;