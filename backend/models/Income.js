const mongoose = require('mongoose');

/**
 * Income Schema - Tracks all user income sources
 * Supports categorization, recurring income, and date filtering
 */
const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide income title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide income amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['salary', 'freelance', 'investments', 'rental', 'business', 'dividends', 'interest', 'gifts', 'refunds', 'other'],
    default: 'salary'
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
  }
}, {
  timestamps: true
});

incomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
