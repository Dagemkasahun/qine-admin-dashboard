// src/pages/merchant/SalesAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  ShoppingBag, Calendar, Download, ChevronRight,
  ArrowUpRight, BarChart3, PieChart, Activity,
  Printer, RefreshCw, Filter, Star, Package
} from 'lucide-react';
import apiClient from '@/api/client';

const SalesAnalytics = () => {
  const { merchantId, businessModel } = useOutletContext();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    stats: {
      totalRevenue: 142850,
      totalOrders: 384,
      newCustomers: 128,
      avgOrderValue: 372
    },
    topProducts: [
      { name: 'White Honey (500g)', sales: 142, revenue: 49700, growth: '+15%' },
      { name: 'Forest Honey (1kg)', sales: 89, revenue: 53400, growth: '+8%' },
      { name: 'Beeswax Candles', sales: 64, revenue: 7680, growth: '-3%' },
    ],
    dailyData: [45, 60, 40, 75, 50, 90, 65, 80, 55, 100, 85, 95],
    categoryData: [
      { name: 'Honey', percentage: 65, revenue: 92850 },
      { name: 'Wax Products', percentage: 20, revenue: 28570 },
      { name: 'Equipment', percentage: 15, revenue: 21430 }
    ]
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, merchantId]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get date range based on selected timeRange
      let startDate, endDate;
      const now = new Date();
      
      switch(timeRange) {
        case 'Last 7 Days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'Last 30 Days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'Last 90 Days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }
      
      endDate = new Date();
      
      const response = await apiClient.get(`/reports/sales`, {
        params: {
          merchantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      const data = response.data;
      
      setAnalytics({
        stats: {
          totalRevenue: data.summary?.totalRevenue || 142850,
          totalOrders: data.summary?.totalOrders || 384,
          newCustomers: data.summary?.newCustomers || 128,
          avgOrderValue: data.summary?.averageOrderValue || 372
        },
        topProducts: data.topProducts || analytics.topProducts,
        dailyData: data.daily?.map(d => d.revenue / 1000) || analytics.dailyData,
        categoryData: data.categoryBreakdown || analytics.categoryData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Keep using mock data
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    alert('📊 Report download started!');
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return `ETB ${amount?.toLocaleString() || 0}`;
  };

  const stats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(analytics.stats.totalRevenue), 
      change: '+12.5%', 
      trend: 'up', 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Orders', 
      value: analytics.stats.totalOrders.toString(), 
      change: '+18.2%', 
      trend: 'up', 
      icon: ShoppingBag, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'New Customers', 
      value: analytics.stats.newCustomers.toString(), 
      change: '-2.4%', 
      trend: 'down', 
      icon: Users, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Avg. Order Value', 
      value: formatCurrency(analytics.stats.avgOrderValue), 
      change: '+5.1%', 
      trend: 'up', 
      icon: Activity, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Sales & Insights
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Financial performance and growth metrics for {businessModel?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none cursor-pointer"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <button 
            onClick={downloadReport}
            className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={printReport}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button 
            onClick={fetchAnalyticsData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts & Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Visualization */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue Growth
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Revenue (ETB)</span>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-64 gap-2 px-4">
            {analytics.dailyData.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all group-hover:from-blue-500 group-hover:to-blue-300 cursor-pointer" 
                    style={{ height: `${Math.min(height, 100)}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ETB {Math.round(height * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {i === 0 ? 'Week 1' : i === 3 ? 'Week 2' : i === 6 ? 'Week 3' : i === 9 ? 'Week 4' : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Highest Day</p>
              <p className="text-sm font-bold text-slate-900">ETB {Math.max(...analytics.dailyData) * 1000}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Average Day</p>
              <p className="text-sm font-bold text-slate-900">
                ETB {Math.round(analytics.dailyData.reduce((a,b) => a + b, 0) / analytics.dailyData.length * 1000)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Growth Rate</p>
              <p className="text-sm font-bold text-emerald-600">+15.3%</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-orange-500" /> Category Breakdown
          </h3>
          <div className="space-y-6">
            {analytics.categoryData.map((category, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800">{category.name}</span>
                  <span className="text-xs font-black text-slate-900">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{category.percentage}% of total</span>
                  <span className="text-[10px] font-bold text-slate-500">{category.sales || 0} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="mt-8 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Best Selling Products
          </h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 rounded-xl">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Units Sold</th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {analytics.topProducts.map((product, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">{product.sales} units</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(product.revenue)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${
                      product.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {product.growth.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {product.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="w-full mt-8 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
          Download Complete Sales Report <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SalesAnalytics;