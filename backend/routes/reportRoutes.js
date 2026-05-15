const express = require('express');
const router = express.Router();
const { getMonthlyReport, exportCSV, getYearlySummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlySummary);
router.get('/export/csv', exportCSV);

module.exports = router;
