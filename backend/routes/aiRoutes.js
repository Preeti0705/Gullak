const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getInsights, getSuggestions, queryData, getStatus } = require('../controllers/aiController');

/**
 * AI Routes — GenAI-powered financial intelligence
 * All routes require authentication
 */

router.use(protect);

router.post('/insights', getInsights);       // AI financial advisor
router.post('/suggest', getSuggestions);      // Smart expense autocomplete
router.post('/query', queryData);            // Natural language queries
router.get('/status', getStatus);            // AI service status

module.exports = router;
