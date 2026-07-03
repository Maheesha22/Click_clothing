const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

// Specific routes first (before :id routes)
router.post('/recommendations/get', comparisonController.getRecommendations);
router.post('/details/with-recommendations', comparisonController.getComparisonWithRecommendations);
router.get('/user/:userId', comparisonController.getUserComparisons);

// Generic ID routes last
router.post('/', comparisonController.saveComparison);
router.get('/:comparisonId', comparisonController.getComparison);
router.put('/:comparisonId', comparisonController.updateComparison);
router.delete('/:comparisonId', comparisonController.deleteComparison);

module.exports = router;
