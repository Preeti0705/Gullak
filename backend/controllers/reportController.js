const Expense = require('../models/Expense');
const Income = require('../models/Income');

/**
 * Report Controller - Generate financial reports and export data
 */

// @desc    Get monthly report
// @route   GET /api/reports/monthly
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: req.user._id, date: { $gte: startDate, $lte: endDate } }).sort('date'),
      Income.find({ user: req.user._id, date: { $gte: startDate, $lte: endDate } }).sort('date')
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
      if (!categoryBreakdown[e.category]) {
        categoryBreakdown[e.category] = { total: 0, count: 0, transactions: [] };
      }
      categoryBreakdown[e.category].total += e.amount;
      categoryBreakdown[e.category].count += 1;
      categoryBreakdown[e.category].transactions.push(e);
    });

    const incomeBreakdown = {};
    incomes.forEach(i => {
      if (!incomeBreakdown[i.category]) {
        incomeBreakdown[i.category] = { total: 0, count: 0 };
      }
      incomeBreakdown[i.category].total += i.amount;
      incomeBreakdown[i.category].count += 1;
    });

    // Daily spending breakdown
    const dailySpending = {};
    expenses.forEach(e => {
      const day = new Date(e.date).getDate();
      if (!dailySpending[day]) dailySpending[day] = 0;
      dailySpending[day] += e.amount;
    });

    res.json({
      success: true,
      data: {
        month: m,
        year: y,
        totalExpenses,
        totalIncome,
        netSavings: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
        categoryBreakdown,
        incomeBreakdown,
        dailySpending,
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        avgDailyExpense: expenses.length > 0 ? (totalExpenses / new Date(y, m, 0).getDate()).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/reports/export/csv
exports.exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'expenses' } = req.query;
    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let data, headers;
    if (type === 'income') {
      data = await Income.find(query).sort('date');
      headers = 'Date,Title,Amount,Category,Notes,Recurring\n';
    } else {
      data = await Expense.find(query).sort('date');
      headers = 'Date,Title,Amount,Category,Payment Method,Notes,Recurring\n';
    }

    let csv = headers;
    data.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const title = `"${item.title.replace(/"/g, '""')}"`;
      const notes = `"${(item.notes || '').replace(/"/g, '""')}"`;
      if (type === 'income') {
        csv += `${date},${title},${item.amount},${item.category},${notes},${item.isRecurring}\n`;
      } else {
        csv += `${date},${title},${item.amount},${item.category},${item.paymentMethod || 'cash'},${notes},${item.isRecurring}\n`;
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get yearly summary
// @route   GET /api/reports/yearly
exports.getYearlySummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [monthlyExpenses, monthlyIncome] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } }
      ]),
      Income.aggregate([
        { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: { year, monthlyExpenses, monthlyIncome }
    });
  } catch (error) {
    next(error);
  }
};
