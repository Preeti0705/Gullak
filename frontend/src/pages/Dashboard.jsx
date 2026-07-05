import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  AlertCircle,
  Zap,
  MoreVertical,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import AiInsightsCard from '../components/dashboard/AiInsightsCard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getOverview();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
          <div className="h-96 bg-surface-200 dark:bg-surface-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { summary, categoryBreakdown, monthlyTrend, incomeTrend, recentTransactions, insights, budgets } = data;

  const chartData = monthlyTrend.map((item, index) => ({
    name: format(new Date(item._id.year, item._id.month - 1), 'MMM'),
    expenses: item.total,
    income: incomeTrend.find(i => i._id.month === item._id.month)?.total || 0
  }));

  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16'];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Welcome back, {user?.name}. Here's your financial summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-surface-400" />
            {format(new Date(), 'MMMM yyyy')}
          </div>
          <button className="premium-button-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Net Balance" 
          amount={summary.balance} 
          icon={Wallet} 
          trend="+12.5%" 
          isPositive={true}
          color="brand"
        />
        <SummaryCard 
          title="Monthly Income" 
          amount={summary.monthlyIncome} 
          icon={TrendingUp} 
          trend="+8.2%" 
          isPositive={true}
          color="emerald"
        />
        <SummaryCard 
          title="Monthly Expenses" 
          amount={summary.monthlyExpenses} 
          icon={TrendingDown} 
          trend="-2.4%" 
          isPositive={true}
          color="rose"
        />
        <SummaryCard 
          title="Savings Rate" 
          amount={`${((summary.monthlyIncome - summary.monthlyExpenses) / summary.monthlyIncome * 100).toFixed(1)}%`} 
          icon={Zap} 
          trend="+3.1%" 
          isPositive={true}
          color="indigo"
          isCurrency={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Cash Flow Performance</h3>
              <p className="text-sm text-surface-500">Income vs Expenses over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                <span className="text-surface-500">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-surface-500">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <AiInsightsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-surface-100 dark:border-surface-800">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm font-semibold text-brand-600 hover:text-brand-500">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-surface-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50 dark:divide-surface-800/50">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">{tx.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-bold text-surface-600 dark:text-surface-400 uppercase">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Budget Monitoring</h3>
          <div className="space-y-6">
            {budgets.length > 0 ? budgets.slice(0, 5).map((budget) => {
              const usage = (budget.spent / budget.limit) * 100;
              const isExceeded = usage >= 100;
              const isWarning = usage >= 80;

              return (
                <div key={budget._id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wide">
                      {budget.category}
                    </span>
                    <span className="text-xs font-bold text-surface-500">
                      ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-10">
                <AlertCircle className="w-12 h-12 text-surface-200 mx-auto mb-4" />
                <p className="text-surface-500 text-sm font-medium">No budgets set for this month</p>
                <button className="mt-4 text-sm font-bold text-brand-600 hover:text-brand-500">Create Budget</button>
              </div>
            )}
          </div>
          {budgets.length > 5 && (
            <button className="w-full mt-8 py-3 bg-surface-50 dark:bg-surface-900 text-sm font-bold text-surface-600 dark:text-surface-400 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              View All Budgets
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, amount, icon: Icon, trend, isPositive, color, isCurrency = true }) => {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-surface-500 uppercase tracking-widest">{title}</p>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
          {isCurrency && typeof amount === 'number' ? `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : amount}
        </h2>
      </div>
    </motion.div>
  );
};

export default Dashboard;
