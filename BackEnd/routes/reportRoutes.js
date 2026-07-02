const express = require('express');
const router  = express.Router();
const { getReportAnalytics, exportCsv, exportPdf } = require('../controllers/reportController');

// GET /api/reports/analytics?period=today|week|month|alltime|custom&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/analytics', getReportAnalytics);

// GET /api/reports/export-csv?period=...&start=...&end=...
router.get('/export-csv', exportCsv);

// GET /api/reports/export-pdf?period=...&start=...&end=...
router.get('/export-pdf', exportPdf);

module.exports = router;
