import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  PieChart as PieIcon, 
  BarChart3, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/monthly', { params: { month, year } });
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export/csv', { 
        params: { type: 'expenses' },
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinTrack_Report_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
        <p className="text-surface-500 font-bold uppercase tracking-widest">Generating Financial Intelligence...</p>
      </div>
    );
  }

  const pieData = Object.entries(data.categoryBreakdown).map(([name, val]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: val.total
  }));

  const dailyData = Object.entries(data.dailySpending).map(([day, total]) => ({
    day: parseInt(day),
    amount: total
  })).sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center gap-3">
            <FileText className="text-brand-600" /> Financial Intelligence
          </h1>
          <p className="text-surface-500 dark:text-surface-400">Comprehensive monthly audit and performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center overflow-hidden h-12">
            <button onClick={() => setMonth(m => (m === 1 ? 12 : m - 1))} className="px-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors h-full">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 font-bold text-xs uppercase tracking-widest">
              {new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
            </div>
            <button onClick={() => setMonth(m => (m === 12 ? 1 : m + 1))} className="px-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors h-full">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleExportCSV}
            className="premium-button-secondary flex items-center gap-2 h-12"
          >
            <Download className="w-4 h-4" /> Export Audit
          </button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricBox title="Total Revenue" amount={data.totalIncome} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/10" />
        <MetricBox title="Total Expenditure" amount={data.totalExpenses} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-900/10" />
        <MetricBox title="Net Profit/Loss" amount={data.netSavings} icon={BarChart3} color="text-brand-600" bg="bg-brand-50 dark:bg-brand-900/10" />
        <MetricBox title="Efficiency Rate" amount={`${data.savingsRate}%`} icon={PieIcon} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenditure Allocation (Pie) */}
        <div className="lg:col-span-1 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-surface-900 dark:text-white uppercase tracking-wider text-sm">Capital Allocation</h3>
            <Info className="w-4 h-4 text-surface-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {pieData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-surface-600 dark:text-surface-400 uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-surface-900 dark:text-surface-100">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Trend (Line) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-surface-900 dark:text-white uppercase tracking-wider text-sm">Daily Liquidity Usage</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-50 dark:bg-surface-900 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-[10px] font-bold text-surface-500">REAL-TIME MONITORING</span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#737373', fontSize: 10}} 
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 10}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Audit List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-bold text-surface-900 dark:text-white uppercase tracking-wider text-sm">Detailed Category Audit</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y divide-surface-100 dark:divide-surface-800">
           {Object.entries(data.categoryBreakdown).map(([cat, details], idx) => (
             <div key={idx} className="p-6 hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors">
               <div className="flex items-center justify-between mb-4">
                 <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                   {cat}
                 </span>
                 <span className="text-xs text-surface-400 font-bold">{details.count} Transactions</span>
               </div>
               <div className="flex items-end justify-between">
                 <div>
                   <p className="text-[10px] font-bold text-surface-400 uppercase mb-1">Total Allocation</p>
                   <p className="text-xl font-bold text-surface-900 dark:text-white">${details.total.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-surface-400 uppercase mb-1">Avg per Tx</p>
                    <p className="text-sm font-bold text-surface-600 dark:text-surface-400">${(details.total / details.count).toFixed(2)}</p>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ title, amount, icon: Icon, color, bg }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 border-l-4 border-l-brand-600"
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">{title}</p>
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <h2 className="text-2xl font-black text-surface-900 dark:text-white">
      {typeof amount === 'number' ? `$${amount.toLocaleString()}` : amount}
    </h2>
  </motion.div>
);

export default Reports;
