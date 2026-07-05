const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Dashboard data cached for 5 minutes per user
router.get('/', protect, cacheMiddleware(300), getDashboard);

module.exports = router;
