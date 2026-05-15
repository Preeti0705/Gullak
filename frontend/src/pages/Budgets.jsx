import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Target,
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { budgetService } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const expenseCategories = ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education', 'housing', 'insurance', 'savings', 'personal', 'travel', 'subscriptions', 'other', 'overall'];

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await budgetService.getBudgets({ month, year });
      setBudgets(response.data);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        toast.success('Budget removed');
        fetchBudgets();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Budget Planning</h1>
          <p className="text-surface-500 dark:text-surface-400">Set financial limits and track your goals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl flex items-center overflow-hidden">
            <button onClick={handlePrevMonth} className="p-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-surface-500" />
            </button>
            <div className="px-4 font-bold text-sm min-w-[140px] text-center border-x border-surface-100 dark:border-surface-800">
              {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={handleNextMonth} className="p-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="premium-button-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
          <p className="text-surface-500 font-medium">Analyzing budget data...</p>
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const usage = (budget.spent / budget.limit) * 100;
            const isExceeded = usage >= 100;
            const isWarning = usage >= 80;

            return (
              <motion.div 
                key={budget._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 group hover:shadow-premium-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isExceeded ? 'bg-rose-100 text-rose-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'
                    }`}>
                      {budget.category === 'overall' ? <Target className="w-6 h-6" /> : <PieIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white capitalize">{budget.category}</h3>
                      <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">{month}/{year} Plan</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(budget._id)}
                    className="p-2 text-surface-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-surface-500 uppercase">Spent</p>
                      <p className={`text-2xl font-bold ${isExceeded ? 'text-rose-600' : 'text-surface-900 dark:text-white'}`}>
                        ${budget.spent.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-surface-500 uppercase">Limit</p>
                      <p className="text-lg font-bold text-surface-700 dark:text-surface-300">
                        ${budget.limit.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-3 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        isExceeded ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 
                        isWarning ? 'bg-amber-500' : 
                        'bg-brand-500 shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-surface-400'}>
                      {usage.toFixed(1)}% Utilized
                    </span>
                    <span className="text-surface-400">
                      {isExceeded ? 'Over budget by ' : 'Remaining: '} 
                      <span className={isExceeded ? 'text-rose-600' : 'text-emerald-600'}>
                        ${Math.abs(budget.limit - budget.spent).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-20 text-center">
          <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">No budgets configured</h2>
          <p className="text-surface-500 mt-2 max-w-md mx-auto">
            Setting a budget helps you stay on track with your financial goals. Create your first budget for this month.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="premium-button-primary mt-8 px-8 py-3 text-lg"
          >
            Create Budget Plan
          </button>
        </div>
      )}

      {/* Recommended Section */}
      {!loading && budgets.length > 0 && (
        <div className="bg-brand-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-brand">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm font-bold uppercase tracking-widest">Growth Recommendation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">You can save an additional $450 this month!</h2>
              <p className="text-brand-100 leading-relaxed">
                Based on your current spending in <strong>Entertainment</strong> and <strong>Dining</strong>, our AI suggests a 15% reduction which could go towards your <strong>Emergency Fund</strong>.
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-brand-600 rounded-2xl font-bold hover:bg-brand-50 transition-all shadow-xl whitespace-nowrap">
              Optimize My Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <BudgetModal 
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => { setIsModalOpen(false); fetchBudgets(); }}
            categories={expenseCategories}
            initialMonth={month}
            initialYear={year}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BudgetModal = ({ onClose, onSuccess, categories, initialMonth, initialYear }) => {
  const [formData, setFormData] = useState({
    category: 'overall',
    limit: '',
    month: initialMonth,
    year: initialYear,
    alertThreshold: 80
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await budgetService.createBudget(formData);
      toast.success('Budget plan active');
      onSuccess();
    } catch (error) {
      toast.error('Failed to set budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-surface-950 rounded-3xl shadow-2xl overflow-hidden border border-surface-200 dark:border-surface-800"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Create Budget</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Target Category</label>
              <select 
                className="premium-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Monthly Limit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">$</span>
                <input 
                  type="number" 
                  required
                  className="premium-input pl-8"
                  placeholder="500"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Month</label>
                <select 
                  className="premium-input"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Year</label>
                <input 
                  type="number" 
                  required
                  className="premium-input"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Alert Threshold</label>
                <span className="text-xs font-bold text-brand-600">{formData.alertThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                step="5"
                className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
              />
              <p className="text-[10px] text-surface-400 mt-2 uppercase tracking-wider font-bold">You will receive a notification at this usage level</p>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="premium-button-outline flex-1 py-3">Cancel</button>
              <button type="submit" disabled={loading} className="premium-button-primary flex-1 py-3 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Budgets;
