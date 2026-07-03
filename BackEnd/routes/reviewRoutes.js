'use strict';

const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const uploadReview = require('../config/multerReview');

// GET all delivered orders with their products (for the "write review" view)
router.get('/eligible-orders', authenticate, reviewController.getDeliveredOrdersForReview);

// GET all reviews submitted by the logged-in user
router.get('/my-reviews', authenticate, reviewController.getUserReviews);

// GET all reviews for a product (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Dev ping route to verify router is reachable
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'reviews router pong' });
});

// POST submit a new review (with optional image upload)
router.post(
  '/',
  authenticate,
  uploadReview.array('images', 5),
  reviewController.submitReview
);

module.exports = router;
