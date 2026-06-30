const express = require('express');
const router = express.Router();
const recentlyViewedController = require('../controllers/recentlyViewedController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

// POST: Add product to recently viewed (or update if exists) - MOST SPECIFIC
router.post('/', authenticate, recentlyViewedController.addToRecentlyViewed);

// DELETE: Clear all recently viewed products for a user (very specific)
router.delete('/clear/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), recentlyViewedController.clearAllRecentlyViewed);

// DELETE: Remove product by userId and productId (specific)
router.delete('/by-product/:userId/:productId', authenticate, requireSelfOrAdmin('params', 'userId'), recentlyViewedController.removeFromRecentlyViewedByProduct);

// DELETE: Remove a single product by ID (generic)
router.delete('/:id', authenticate, recentlyViewedController.removeFromRecentlyViewed);

// GET: Fetch recently viewed products for a user (LAST - least specific)
router.get('/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), recentlyViewedController.getRecentlyViewed);

module.exports = router;
