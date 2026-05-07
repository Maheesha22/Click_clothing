const express = require('express');
const router = express.Router();
const customerOrderController = require('../controllers/customerOrderController');

router.get('/user/:userId', customerOrderController.getCustomerOrders);

module.exports = router;
