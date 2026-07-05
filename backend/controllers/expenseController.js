const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const { invalidateCache } = require('../config/redisClient');

/**
 * Helper: Invalidate all cached data for a user after a write operation
 */
const invalidateUserCache = async (userId) => {
  await Promise.all([
    invalidateCache(`cache:${userId}:*`),
    invalidateCache(`ai:insights:${userId}`),
  ]);
};

/**
 * Expense Controller - Full CRUD with filtering, pagination, and budget tracking
 */

// @desc    Get all expenses for user
// @route   GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, search, sort = '-date' } = req.query;

    const query = { user: req.user._id };

    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
exports.createExpense = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const expense = await Expense.create(req.body);

    // Update budget spent amount
    const expDate = new Date(expense.date);
    const budget = await Budget.findOne({
      user: req.user._id,
      category: expense.category,
      month: expDate.getMonth() + 1,
      year: expDate.getFullYear()
    });

    if (budget) {
      budget.spent += expense.amount;
      await budget.save();

      // Check if budget threshold exceeded
      const usage = (budget.spent / budget.limit) * 100;
      if (usage >= budget.alertThreshold && usage < 100) {
        await Notification.create({
          user: req.user._id,
          title: 'Budget Alert',
          message: `You've used ${Math.round(usage)}% of your ${expense.category} budget ($${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)})`,
          type: 'budget_alert',
          metadata: { budgetId: budget._id, category: expense.category, usage }
        });
      } else if (usage >= 100) {
        await Notification.create({
          user: req.user._id,
          title: 'Budget Exceeded!',
          message: `You've exceeded your ${expense.category} budget by $${(budget.spent - budget.limit).toFixed(2)}`,
          type: 'budget_exceeded',
          metadata: { budgetId: budget._id, category: expense.category, usage }
        });
      }
    }

    // Also update overall budget
    const overallBudget = await Budget.findOne({
      user: req.user._id,
      category: 'overall',
      month: expDate.getMonth() + 1,
      year: expDate.getFullYear()
    });

    if (overallBudget) {
      overallBudget.spent += expense.amount;
      await overallBudget.save();
    }

    // Invalidate cached dashboard + AI insights
    await invalidateUserCache(req.user._id.toString());

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const oldAmount = expense.amount;
    const oldCategory = expense.category;

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update budget if amount or category changed
    if (oldAmount !== expense.amount || oldCategory !== expense.category) {
      const expDate = new Date(expense.date);
      const month = expDate.getMonth() + 1;
      const year = expDate.getFullYear();

      // Remove old amount from old category budget
      const oldBudget = await Budget.findOne({ user: req.user._id, category: oldCategory, month, year });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - oldAmount);
        await oldBudget.save();
      }

      // Add new amount to new category budget
      const newBudget = await Budget.findOne({ user: req.user._id, category: expense.category, month, year });
      if (newBudget) {
        newBudget.spent += expense.amount;
        await newBudget.save();
      }

      // Update overall budget
      const overallBudget = await Budget.findOne({ user: req.user._id, category: 'overall', month, year });
      if (overallBudget) {
        overallBudget.spent = Math.max(0, overallBudget.spent - oldAmount + expense.amount);
        await overallBudget.save();
      }
    }

    // Invalidate cached dashboard + AI insights
    await invalidateUserCache(req.user._id.toString());

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Update budget
    const expDate = new Date(expense.date);
    const budget = await Budget.findOne({
      user: req.user._id,
      category: expense.category,
      month: expDate.getMonth() + 1,
      year: expDate.getFullYear()
    });
    if (budget) {
      budget.spent = Math.max(0, budget.spent - expense.amount);
      await budget.save();
    }

    const overallBudget = await Budget.findOne({
      user: req.user._id,
      category: 'overall',
      month: expDate.getMonth() + 1,
      year: expDate.getFullYear()
    });
    if (overallBudget) {
      overallBudget.spent = Math.max(0, overallBudget.spent - expense.amount);
      await overallBudget.save();
    }

    await expense.deleteOne();

    // Invalidate cached dashboard + AI insights
    await invalidateUserCache(req.user._id.toString());

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};
