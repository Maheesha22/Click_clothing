const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

// ========== ROUTE FOR ELIGIBLE ORDERS (must be before /:id) ==========
router.get('/eligible-orders', returnController.getEligibleOrdersForReturns);

// ========== ROUTE FOR MULTI-PRODUCT RETURNS ==========
router.post('/multi-product', returnController.createMultiProductReturn);

// Get returns statistics (monthly/weekly) - must be before /:id
router.get('/stats', returnController.getReturnsStats);

// Get returns by date range (week/month) - must be before /:id
router.get('/date-range', returnController.getReturnsByDateRange);

// Get returns for a specific user - must be before /:id
router.get('/user/:userId', returnController.getUserReturns);

// Get all returns
router.get('/', returnController.getAllReturns);

// Get specific return by ID
router.get('/:id', returnController.getReturnById);

// Create new return (single product - legacy)
router.post('/create', returnController.createReturn);

// Update return
router.put('/:id', returnController.updateReturn);

// Delete return
router.delete('/:id', returnController.deleteReturn);

module.exports = router;
