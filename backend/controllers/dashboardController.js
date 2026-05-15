const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');

/**
 * Dashboard Controller - Aggregated analytics and insights
 */

// @desc    Get dashboard overview data
// @route   GET /api/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Total income and expenses for current month
    const [monthlyExpenses, monthlyIncome, totalExpenses, totalIncome] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Category breakdown for current month
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const incomeTrend = await Income.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent transactions (last 5)
    const recentExpenses = await Expense.find({ user: userId }).sort('-date').limit(5);
    const recentIncomes = await Income.find({ user: userId }).sort('-date').limit(5);

    // Combine and sort recent transactions
    const recentTransactions = [
      ...recentExpenses.map(e => ({ ...e.toObject(), type: 'expense' })),
      ...recentIncomes.map(i => ({ ...i.toObject(), type: 'income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    // Budget status
    const budgets = await Budget.find({
      user: userId,
      month: currentMonth + 1,
      year: currentYear
    });

    // AI Insights generation
    const insights = generateInsights(
      monthlyExpenses[0]?.total || 0,
      monthlyIncome[0]?.total || 0,
      categoryBreakdown,
      budgets,
      monthlyTrend
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome: totalIncome[0]?.total || 0,
          totalExpenses: totalExpenses[0]?.total || 0,
          monthlyIncome: monthlyIncome[0]?.total || 0,
          monthlyExpenses: monthlyExpenses[0]?.total || 0,
          balance: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
          monthlyBalance: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0)
        },
        categoryBreakdown,
        monthlyTrend,
        incomeTrend,
        recentTransactions,
        budgets,
        insights
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate AI-style financial insights from data
 */
function generateInsights(monthlyExp, monthlyInc, categories, budgets, trend) {
  const insights = [];

  // Savings rate insight
  if (monthlyInc > 0) {
    const savingsRate = ((monthlyInc - monthlyExp) / monthlyInc * 100).toFixed(0);
    if (savingsRate > 30) {
      insights.push({ type: 'positive', icon: '🎯', message: `Excellent! You're saving ${savingsRate}% of your income this month.` });
    } else if (savingsRate > 10) {
      insights.push({ type: 'neutral', icon: '💡', message: `You're saving ${savingsRate}% of your income. Try to aim for 30%+.` });
    } else if (savingsRate > 0) {
      insights.push({ type: 'warning', icon: '⚠️', message: `Low savings rate of ${savingsRate}%. Consider reducing discretionary spending.` });
    } else {
      insights.push({ type: 'danger', icon: '🚨', message: `You're spending more than you earn this month! Review your expenses immediately.` });
    }
  }

  // Top spending category
  if (categories.length > 0) {
    const topCat = categories[0];
    const percentage = monthlyExp > 0 ? ((topCat.total / monthlyExp) * 100).toFixed(0) : 0;
    insights.push({
      type: 'info',
      icon: '📊',
      message: `${topCat._id.charAt(0).toUpperCase() + topCat._id.slice(1)} is your highest expense category at ${percentage}% of total spending ($${topCat.total.toFixed(2)}).`
    });
  }

  // Budget alerts
  budgets.forEach(budget => {
    if (budget.limit > 0) {
      const usage = (budget.spent / budget.limit) * 100;
      if (usage >= 100) {
        insights.push({
          type: 'danger',
          icon: '🔴',
          message: `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.limit).toFixed(2)}.`
        });
      } else if (usage >= 80) {
        insights.push({
          type: 'warning',
          icon: '🟡',
          message: `${budget.category} budget is at ${usage.toFixed(0)}%. Only $${(budget.limit - budget.spent).toFixed(2)} remaining.`
        });
      }
    }
  });

  // Spending trend insight
  if (trend.length >= 2) {
    const lastMonth = trend[trend.length - 1]?.total || 0;
    const prevMonth = trend[trend.length - 2]?.total || 0;
    if (prevMonth > 0) {
      const change = ((lastMonth - prevMonth) / prevMonth * 100).toFixed(0);
      if (change > 10) {
        insights.push({ type: 'warning', icon: '📈', message: `Spending increased ${change}% compared to last month.` });
      } else if (change < -10) {
        insights.push({ type: 'positive', icon: '📉', message: `Great job! Spending decreased ${Math.abs(change)}% compared to last month.` });
      }
    }
  }

  // Suggested savings
  if (monthlyExp > 0) {
    const suggestedSavings = (monthlyInc * 0.2).toFixed(2);
    insights.push({
      type: 'info',
      icon: '💰',
      message: `Suggested monthly savings target: $${suggestedSavings} (20% of income).`
    });
  }

  return insights.slice(0, 5);
}
