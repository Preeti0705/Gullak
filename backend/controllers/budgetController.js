const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

/**
 * Budget Controller - Manage monthly and category budgets
 */

// @desc    Get budgets for current month
// @route   GET /api/budgets
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    let budgets = await Budget.find({ user: req.user._id, month: m, year: y });

    // Calculate actual spent for each budget from expenses
    for (let budget of budgets) {
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);

      const matchQuery = {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      };

      if (budget.category !== 'overall') {
        matchQuery.category = budget.category;
      }

      const result = await Expense.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      budget.spent = result.length > 0 ? result[0].total : 0;
      await budget.save();
    }

    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
exports.createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year, alertThreshold } = req.body;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    let budget = await Budget.findOne({
      user: req.user._id,
      category,
      month: m,
      year: y
    });

    if (budget) {
      budget.limit = limit;
      if (alertThreshold) budget.alertThreshold = alertThreshold;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user._id,
        category,
        limit,
        month: m,
        year: y,
        alertThreshold: alertThreshold || 80
      });
    }

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    await budget.deleteOne();
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};
