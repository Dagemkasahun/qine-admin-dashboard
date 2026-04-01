import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  ShoppingBag, Calendar, Download, ChevronRight,
  ArrowUpRight, BarChart3, PieChart, Activity
} from 'lucide-react';

const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  // Mock Data for the Analytics Model
  const stats = [
    { label: 'Total Revenue', value: 'ETB 142,850', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: '384', change: '+18.2%', trend: 'up', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'New Customers', value: '128', change: '-2.4%', trend: 'down', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Avg. Order Value', value: 'ETB 372', change: '+5.1%', trend: 'up', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const topProducts = [
    { name: 'White Honey (500g)', sales: 142, revenue: 'ETB 49,700', growth: '+15%' },
    { name: 'Forest Honey (1kg)', sales: 89, revenue: 'ETB 53,400', growth: '+8%' },
    { name: 'Beeswax Candles', sales: 64, revenue: 'ETB 7,680', growth: '-3%' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sales & Insights</h1>
          <p className="text-slate-500 text-sm font-medium">Financial performance and growth metrics</p>
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
          <button className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
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
        
        {/* Revenue Visualization Mockup */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue Growth
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Current</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Previous</span>
            </div>
          </div>
          
          {/* Visualizing Bar Chart with Tailwind */}
          <div className="flex items-end justify-between h-64 gap-2 px-4">
            {[45, 60, 40, 75, 50, 90, 65, 80, 55, 100, 85, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-400 relative" 
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {height}k
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-orange-500" /> Best Sellers
          </h3>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-800">{product.name}</span>
                  <span className="text-xs font-black text-slate-900">{product.revenue}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-orange-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${100 - (i * 20)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{product.sales} units sold</span>
                  <span className={`text-[10px] font-bold ${product.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>
                    {product.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-2">
            View Full Report <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SalesAnalytics;