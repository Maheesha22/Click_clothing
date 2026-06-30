const express = require('express');
const router = express.Router();
const { getCustomerDashboardData } = require('../controllers/adminCustomerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/dashboard-data', authenticate, requireAdmin, getCustomerDashboardData);

module.exports = router;
