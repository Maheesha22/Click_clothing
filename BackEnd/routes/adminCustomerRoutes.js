const express = require('express');
const router = express.Router();
const { getCustomerDashboardData } = require('../controllers/adminCustomerController');

router.get('/dashboard-data', getCustomerDashboardData);

module.exports = router;
