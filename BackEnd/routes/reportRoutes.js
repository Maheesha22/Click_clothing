const express = require('express');
const router = express.Router();
const { getReportStats } = require('../controllers/reportController');

router.get('/stats', getReportStats);

module.exports = router;
