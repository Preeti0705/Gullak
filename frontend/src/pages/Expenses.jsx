import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreVertical, 
  Trash2, 
  Edit3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { expenseService } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ category: 'all', search: '', page: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const categories = ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education', 'housing', 'insurance', 'savings', 'personal', 'travel', 'subscriptions', 'other'];

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getExpenses(filters);
      setExpenses(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const openModal = (expense = null) => {
    setCurrentExpense(expense);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Expenses</h1>
          <p className="text-surface-500 dark:text-surface-400">Track and manage your corporate expenditures</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="premium-button-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => openModal()}
            className="premium-button-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search by title or notes..."
            className="premium-input pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="premium-input min-w-[150px]"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <button className="p-2.5 bg-surface-100 dark:bg-surface-800 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <p className="text-surface-500 font-medium">Processing request...</p>
          </div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-surface-400 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Title</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Method</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50 dark:divide-surface-800/50">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{expense.title}</span>
                        {expense.notes && <span className="text-xs text-surface-400 truncate max-w-[200px]">{expense.notes}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-surface-500 uppercase tracking-tighter">
                        {expense.paymentMethod?.replace('_', ' ') || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-rose-600">
                        -${expense.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openModal(expense)}
                          className="p-2 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense._id)}
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
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">No expenses found</h3>
            <p className="text-surface-500 mt-1">Try adjusting your filters or add a new transaction.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="p-6 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing <span className="font-bold">{expenses.length}</span> of <span className="font-bold">{pagination.total}</span> records
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
            type="expense"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => { setIsModalOpen(false); fetchExpenses(); }}
            expense={currentExpense}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const TransactionModal = ({ type, isOpen, onClose, onSuccess, expense, categories }) => {
  const [formData, setFormData] = useState(
    expense ? { ...expense, date: expense.date.split('T')[0] } : {
    title: '',
    amount: '',
    category: type === 'expense' ? 'food' : 'salary',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'cash'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (expense) {
        await (type === 'expense' ? expenseService.updateExpense(expense._id, formData) : incomeService.updateIncome(expense._id, formData));
        toast.success(`${type === 'expense' ? 'Expense' : 'Income'} updated`);
      } else {
        await (type === 'expense' ? expenseService.createExpense(formData) : incomeService.createIncome(formData));
        toast.success(`${type === 'expense' ? 'Expense' : 'Income'} added`);
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save transaction');
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
        className="relative w-full max-w-lg bg-white dark:bg-surface-950 rounded-3xl shadow-2xl overflow-hidden border border-surface-200 dark:border-surface-800"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
              {expense ? `Edit ${type}` : `Add New ${type}`}
            </h2>
            <button onClick={onClose} className="p-2 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-900 rounded-xl transition-colors">
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  className="premium-input"
                  placeholder="e.g. Monthly Rent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">$</span>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    className="premium-input pl-8"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Date</label>
                <input 
                  type="date" 
                  required
                  className="premium-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Category</label>
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
              {type === 'expense' && (
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Payment Method</label>
                  <select 
                    className="premium-input"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI / Digital</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Notes (Optional)</label>
              <textarea 
                className="premium-input min-h-[100px] resize-none"
                placeholder="Add any additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="premium-button-outline flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="premium-button-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (expense ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export { TransactionModal };
export default Expenses;
