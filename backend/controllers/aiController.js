const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { generateFinancialInsights, suggestExpenseDetails, queryFinancialData, isAIAvailable } = require('../services/aiService');
const { getCache, setCache } = require('../config/redisClient');

/**
 * AI Controller — Handles GenAI-powered financial intelligence endpoints
 */

// @desc    Get AI-powered financial insights
// @route   POST /api/ai/insights
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cacheKey = `ai:insights:${userId}`;

    // Check cache first (AI insights cached for 10 min)
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Gather user's financial data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [monthlyExpAgg, monthlyIncAgg, totalExpAgg, totalIncAgg, categoryBreakdown, monthlyTrend, budgets] = await Promise.all([
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
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() })
    ]);

    const userData = {
      summary: {
        totalIncome: totalIncAgg[0]?.total || 0,
        totalExpenses: totalExpAgg[0]?.total || 0,
        monthlyIncome: monthlyIncAgg[0]?.total || 0,
        monthlyExpenses: monthlyExpAgg[0]?.total || 0,
        balance: (totalIncAgg[0]?.total || 0) - (totalExpAgg[0]?.total || 0),
        monthlyBalance: (monthlyIncAgg[0]?.total || 0) - (monthlyExpAgg[0]?.total || 0)
      },
      categoryBreakdown,
      monthlyTrend,
      budgets
    };

    const result = await generateFinancialInsights(userData);

    // Cache for 10 minutes
    await setCache(cacheKey, result, 600);

    res.json({ success: true, data: result, cached: false });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart expense suggestions
// @route   POST /api/ai/suggest
exports.getSuggestions = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.length < 2) {
      return res.status(400).json({ success: false, message: 'Title must be at least 2 characters' });
    }

    // Get user's recent expenses for context
    const recentExpenses = await Expense.find({ user: req.user._id })
      .sort('-date')
      .limit(20)
      .select('title category amount');

    const result = await suggestExpenseDetails(title, recentExpenses);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Natural language financial query
// @route   POST /api/ai/query
exports.queryData = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || question.length < 5) {
      return res.status(400).json({ success: false, message: 'Please ask a more detailed question' });
    }

    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyExpAgg, monthlyIncAgg, totalExpAgg, totalIncAgg, categoryBreakdown, recentTransactions, budgets] = await Promise.all([
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
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Expense.find({ user: userId }).sort('-date').limit(10),
      Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() })
    ]);

    const userData = {
      summary: {
        totalIncome: totalIncAgg[0]?.total || 0,
        totalExpenses: totalExpAgg[0]?.total || 0,
        monthlyIncome: monthlyIncAgg[0]?.total || 0,
        monthlyExpenses: monthlyExpAgg[0]?.total || 0,
        balance: (totalIncAgg[0]?.total || 0) - (totalExpAgg[0]?.total || 0),
        monthlyBalance: (monthlyIncAgg[0]?.total || 0) - (monthlyExpAgg[0]?.total || 0)
      },
      categoryBreakdown,
      recentTransactions: recentTransactions.map(t => ({ ...t.toObject(), type: 'expense' })),
      budgets
    };

    const result = await queryFinancialData(question, userData);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Check AI service status
// @route   GET /api/ai/status
exports.getStatus = async (req, res) => {
  res.json({
    success: true,
    data: {
      aiAvailable: isAIAvailable(),
      provider: isAIAvailable() ? 'Google Gemini' : 'Fallback (rule-based)',
      model: isAIAvailable() ? 'gemini-2.0-flash' : null,
    }
  });
};
