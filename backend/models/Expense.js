const mongoose = require('mongoose');

/**
 * Expense Schema - Tracks all user expenditures
 * Supports categories, recurring flags, notes, and date filtering
 */
const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide expense title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education', 'housing', 'insurance', 'savings', 'personal', 'travel', 'subscriptions', 'other'],
    default: 'other'
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', ''],
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'other'],
    default: 'cash'
  }
}, {
  timestamps: true
});

// Index for efficient querying
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
