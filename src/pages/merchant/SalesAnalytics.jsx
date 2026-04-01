import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart } from 'lucide-react';

const SalesAnalytics = () => {
  const stats = [
    { label: 'Net Sales', value: 'ETB 45,200', change: '+12.5%', icon: DollarSign, positive: true },
    { label: 'Orders', value: '124', change: '+8.2%', icon: ShoppingCart, positive: true },
    { label: 'Avg. Order Value', value: 'ETB 365', change: '-2.1%', icon: TrendingUp, positive: false },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">Sales Analytics</h1>
        <p className="text-slate-500 text-sm font-medium">Performance tracking for the last 30 days</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Simple Placeholder Chart Area */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 h-64 flex items-center justify-center text-slate-300 italic font-medium">
        Revenue Chart Visualisation Coming Soon
      </div>
    </div>
  );
};

export default SalesAnalytics;