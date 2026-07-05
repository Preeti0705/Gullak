const Income = require('../models/Income');
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
 * Income Controller - Full CRUD with filtering and pagination
 */

// @desc    Get all income for user
// @route   GET /api/income
exports.getIncomes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, search, sort = '-date' } = req.query;

    const query = { user: req.user._id };
    if (category && category !== 'all') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Income.countDocuments(query);
    const incomes = await Income.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: incomes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create income
// @route   POST /api/income
exports.createIncome = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const income = await Income.create(req.body);
    await invalidateUserCache(req.user._id.toString());
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
exports.updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await invalidateUserCache(req.user._id.toString());
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    await income.deleteOne();
    await invalidateUserCache(req.user._id.toString());
    res.json({ success: true, message: 'Income deleted' });
  } catch (error) {
    next(error);
  }
};
