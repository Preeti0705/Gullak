import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { incomeService } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { TransactionModal } from './Expenses';
import { AnimatePresence } from 'framer-motion';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ category: 'all', search: '', page: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);

  const categories = ['salary', 'freelance', 'investments', 'rental', 'business', 'dividends', 'interest', 'gifts', 'refunds', 'other'];

  useEffect(() => {
    fetchIncomes();
  }, [filters]);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const response = await incomeService.getIncomes(filters);
      setIncomes(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await incomeService.deleteIncome(id);
        toast.success('Income record deleted');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const openModal = (income = null) => {
    setCurrentIncome(income);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Income</h1>
          <p className="text-surface-500 dark:text-surface-400">Manage and monitor your revenue streams</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => openModal()}
            className="premium-button-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Income
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">Monthly Income</p>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
              ${incomes.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search income sources..."
            className="premium-input pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <select 
          className="premium-input min-w-[150px] w-full md:w-auto"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <p className="text-surface-500 font-medium">Processing request...</p>
          </div>
        ) : incomes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-surface-400 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Source</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50 dark:divide-surface-800/50">
                {incomes.map((income) => (
                  <tr key={income._id} className="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {format(new Date(income.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{income.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600">
                        +${income.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openModal(income)}
                          className="p-2 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(income._id)}
                          className="p-2 text-surface-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-surface-50 dark:bg-surface-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-surface-300" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">No income records found</h3>
            <p className="text-surface-500 mt-1">Start by adding your first revenue stream.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="p-6 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing <span className="font-bold">{incomes.length}</span> of <span className="font-bold">{pagination.total}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
              className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 disabled:opacity-30 hover:bg-surface-50 dark:hover:bg-surface-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                    pagination.page === i + 1 
                      ? 'bg-brand-600 text-white shadow-brand' 
                      : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-900'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.page === pagination.pages}
              onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
              className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 disabled:opacity-30 hover:bg-surface-50 dark:hover:bg-surface-900"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            type="income"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => { setIsModalOpen(false); fetchIncomes(); }}
            expense={currentIncome}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Income;
