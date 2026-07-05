const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { initRedis, getCacheStats, getRedisStatus } = require('./config/redisClient');
const { initAI, isAIAvailable } = require('./services/aiService');
const { initQueues, getQueueStats } = require('./services/queueService');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to database
connectDB();

// Initialize Redis cache
initRedis();

// Initialize Gemini AI
initAI();

// Initialize job queues
initQueues();

const app = express();

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// AI endpoints get a separate, stricter rate limit (Gemini free tier = 15 RPM)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 12,              // 12 req/min (under the 15 RPM Gemini limit)
  message: { success: false, message: 'AI rate limit reached. Please wait a moment.' }
});
app.use('/api/ai/', aiLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Enhanced health check with system metrics
app.get('/api/health', async (req, res) => {
  const cacheStats = getCacheStats();
  const queueStats = await getQueueStats();
  const memUsage = process.memoryUsage();

  res.json({
    success: true,
    message: 'FinTrack API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      redis: getRedisStatus() ? 'connected' : 'disconnected (graceful fallback)',
      ai: isAIAvailable() ? 'Gemini active' : 'Fallback mode',
      queue: queueStats.available ? 'ready' : 'unavailable',
    },
    cache: cacheStats,
    queue: queueStats,
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)} MB`,
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FinTrack API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
