const express = require('express');
const router = express.Router();
const youMayAlsoLikeController = require('../controllers/youMayAlsoLikeController');

// GET /api/you-may-also-like
router.get('/', youMayAlsoLikeController.getRecommendations);

module.exports = router;
