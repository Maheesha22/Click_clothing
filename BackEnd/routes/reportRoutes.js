const express = require('express');
const router  = express.Router();
const { getReportAnalytics } = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/reports/analytics?period=today|week|month|alltime|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/analytics', authenticate, requireAdmin, getReportAnalytics);

module.exports = router;
