const express = require('express');
const router = express.Router();
const customerOrderController = require('../controllers/customerOrderController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/user/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), customerOrderController.getCustomerOrders);

module.exports = router;
