const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/', feedbackController.createFeedback);
router.get('/public', feedbackController.getPublicFeedbacks);

// Admin routes
router.get('/all', authenticate, requireAdmin, feedbackController.getAllFeedbacks);
router.delete('/:id', authenticate, requireAdmin, feedbackController.deleteFeedback);

module.exports = router;
