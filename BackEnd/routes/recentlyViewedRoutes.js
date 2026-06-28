const express = require('express');
const router = express.Router();
const recentlyViewedController = require('../controllers/recentlyViewedController');

// POST: Add product to recently viewed (or update if exists) - MOST SPECIFIC
router.post('/', recentlyViewedController.addToRecentlyViewed);

// DELETE: Clear all recently viewed products for a user (very specific)
router.delete('/clear/:userId', recentlyViewedController.clearAllRecentlyViewed);

// DELETE: Remove product by userId and productId (specific)
router.delete('/by-product/:userId/:productId', recentlyViewedController.removeFromRecentlyViewedByProduct);

// DELETE: Remove a single product by ID (generic)
router.delete('/:id', recentlyViewedController.removeFromRecentlyViewed);

// GET: Fetch recently viewed products for a user (LAST - least specific)
router.get('/:userId', recentlyViewedController.getRecentlyViewed);

module.exports = router;
