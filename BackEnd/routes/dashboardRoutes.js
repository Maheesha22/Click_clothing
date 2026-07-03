const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');
// GET /api/dashboard/stats
router.get('/stats', authenticate, requireAdmin, getDashboardStats);

module.exports = router;
