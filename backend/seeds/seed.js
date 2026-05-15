require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

/**
 * Database Seed Script
 * Creates realistic demo data for FinTrack application
 * Run: npm run seed
 */

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Expense.deleteMany({}),
      Income.deleteMany({}),
      Budget.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Preeti Sharma',
      email: 'demo@fintrack.com',
      password: 'demo123456',
      currency: 'USD',
      theme: 'dark',
      monthlyBudget: 3000
    });
    console.log('👤 Demo user created: demo@fintrack.com / demo123456');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Generate realistic expenses for the last 6 months
    const expenseTemplates = [
      { title: 'Grocery Shopping', category: 'food', min: 40, max: 120, paymentMethod: 'debit_card' },
      { title: 'Restaurant Dinner', category: 'food', min: 25, max: 85, paymentMethod: 'credit_card' },
      { title: 'Coffee & Snacks', category: 'food', min: 5, max: 15, paymentMethod: 'upi' },
      { title: 'Uber Ride', category: 'transportation', min: 8, max: 35, paymentMethod: 'upi' },
      { title: 'Gas Station', category: 'transportation', min: 30, max: 65, paymentMethod: 'debit_card' },
      { title: 'Metro Pass', category: 'transportation', min: 50, max: 50, paymentMethod: 'upi', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Netflix Subscription', category: 'entertainment', min: 15.99, max: 15.99, paymentMethod: 'credit_card', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Spotify Premium', category: 'subscriptions', min: 9.99, max: 9.99, paymentMethod: 'credit_card', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Movie Night', category: 'entertainment', min: 15, max: 40, paymentMethod: 'upi' },
      { title: 'Amazon Purchase', category: 'shopping', min: 20, max: 200, paymentMethod: 'credit_card' },
      { title: 'Clothing Store', category: 'shopping', min: 30, max: 150, paymentMethod: 'credit_card' },
      { title: 'Electric Bill', category: 'utilities', min: 60, max: 120, paymentMethod: 'bank_transfer', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Internet Bill', category: 'utilities', min: 49.99, max: 49.99, paymentMethod: 'bank_transfer', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Phone Bill', category: 'utilities', min: 35, max: 55, paymentMethod: 'bank_transfer', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Doctor Visit', category: 'healthcare', min: 30, max: 150, paymentMethod: 'debit_card' },
      { title: 'Pharmacy', category: 'healthcare', min: 10, max: 45, paymentMethod: 'cash' },
      { title: 'Online Course', category: 'education', min: 10, max: 50, paymentMethod: 'credit_card' },
      { title: 'Rent Payment', category: 'housing', min: 1200, max: 1200, paymentMethod: 'bank_transfer', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Health Insurance', category: 'insurance', min: 200, max: 200, paymentMethod: 'bank_transfer', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Gym Membership', category: 'personal', min: 40, max: 40, paymentMethod: 'credit_card', isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Weekend Trip', category: 'travel', min: 100, max: 400, paymentMethod: 'credit_card' },
      { title: 'Cloud Storage', category: 'subscriptions', min: 2.99, max: 9.99, paymentMethod: 'credit_card', isRecurring: true, recurringFrequency: 'monthly' },
    ];

    const expenses = [];
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const m = currentMonth - monthOffset;
      const date = new Date(currentYear, m, 1);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      // Add 15-25 expenses per month
      const count = Math.floor(Math.random() * 11) + 15;
      for (let i = 0; i < count; i++) {
        const template = expenseTemplates[Math.floor(Math.random() * expenseTemplates.length)];
        const amount = parseFloat((Math.random() * (template.max - template.min) + template.min).toFixed(2));
        const day = Math.floor(Math.random() * daysInMonth) + 1;

        expenses.push({
          user: user._id,
          title: template.title,
          amount,
          category: template.category,
          date: new Date(date.getFullYear(), date.getMonth(), day),
          notes: `${template.title} - ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]}`,
          isRecurring: template.isRecurring || false,
          recurringFrequency: template.recurringFrequency || '',
          paymentMethod: template.paymentMethod
        });
      }
    }
    await Expense.insertMany(expenses);
    console.log(`💸 Created ${expenses.length} expenses`);

    // Generate realistic income
    const incomeTemplates = [
      { title: 'Monthly Salary', category: 'salary', amount: 5200, isRecurring: true, recurringFrequency: 'monthly' },
      { title: 'Freelance Project', category: 'freelance', min: 300, max: 1500 },
      { title: 'Stock Dividends', category: 'dividends', min: 50, max: 200 },
      { title: 'Interest Income', category: 'interest', min: 10, max: 50 },
      { title: 'Side Business', category: 'business', min: 100, max: 800 },
    ];

    const incomes = [];
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const m = currentMonth - monthOffset;
      const date = new Date(currentYear, m, 1);

      // Salary - always on 1st
      incomes.push({
        user: user._id,
        title: 'Monthly Salary',
        amount: 5200,
        category: 'salary',
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        notes: 'Regular monthly salary',
        isRecurring: true,
        recurringFrequency: 'monthly'
      });

      // Random additional income 1-3 times per month
      const extraCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < extraCount; i++) {
        const template = incomeTemplates[Math.floor(Math.random() * (incomeTemplates.length - 1)) + 1];
        const amount = template.amount || parseFloat((Math.random() * (template.max - template.min) + template.min).toFixed(2));
        incomes.push({
          user: user._id,
          title: template.title,
          amount,
          category: template.category,
          date: new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1),
          isRecurring: template.isRecurring || false,
          recurringFrequency: template.recurringFrequency || ''
        });
      }
    }
    await Income.insertMany(incomes);
    console.log(`💰 Created ${incomes.length} income records`);

    // Create budgets for current month
    const budgetCategories = [
      { category: 'overall', limit: 3000 },
      { category: 'food', limit: 500 },
      { category: 'transportation', limit: 200 },
      { category: 'entertainment', limit: 150 },
      { category: 'shopping', limit: 300 },
      { category: 'utilities', limit: 250 },
      { category: 'healthcare', limit: 200 },
      { category: 'housing', limit: 1200 },
      { category: 'subscriptions', limit: 50 },
    ];

    const budgets = budgetCategories.map(b => ({
      user: user._id,
      category: b.category,
      limit: b.limit,
      month: currentMonth + 1,
      year: currentYear,
      alertThreshold: 80
    }));
    await Budget.insertMany(budgets);
    console.log(`📊 Created ${budgets.length} budgets`);

    // Create sample notifications
    const notifications = [
      {
        user: user._id,
        title: 'Welcome to FinTrack!',
        message: 'Start tracking your expenses and income to gain financial insights.',
        type: 'system'
      },
      {
        user: user._id,
        title: 'Budget Alert',
        message: 'You\'ve used 85% of your food budget this month.',
        type: 'budget_alert',
        metadata: { category: 'food', usage: 85 }
      },
      {
        user: user._id,
        title: 'Monthly Report Ready',
        message: 'Your financial report for last month is ready to view.',
        type: 'system'
      }
    ];
    await Notification.insertMany(notifications);
    console.log(`🔔 Created ${notifications.length} notifications`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Login: demo@fintrack.com');
    console.log('🔑 Password: demo123456\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
