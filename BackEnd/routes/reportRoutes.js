const express = require('express');
const router  = express.Router();
const { getReportAnalytics } = require('../controllers/reportController');

// GET /api/reports/analytics?period=today|week|month|alltime|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/analytics', getReportAnalytics);

module.exports = router;
