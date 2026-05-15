const mongoose = require('mongoose');

/**
 * Budget Schema - Monthly and category-level budget tracking
 * Tracks budget limits and actual spending for alerts
 */
const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['food', 'transportation', 'entertainment', 'shopping', 'utilities', 'healthcare', 'education', 'housing', 'insurance', 'savings', 'personal', 'travel', 'subscriptions', 'other', 'overall'],
    default: 'overall'
  },
  limit: {
    type: Number,
    required: [true, 'Please provide budget limit'],
    min: [1, 'Budget limit must be at least 1']
  },
  spent: {
    type: Number,
    default: 0
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 1,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

budgetSchema.index({ user: 1, month: 1, year: 1 });
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Virtual for usage percentage
budgetSchema.virtual('usagePercentage').get(function() {
  return this.limit > 0 ? Math.round((this.spent / this.limit) * 100) : 0;
});

budgetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
