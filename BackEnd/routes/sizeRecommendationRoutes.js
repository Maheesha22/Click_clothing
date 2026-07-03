const express = require('express');
const router = express.Router();
const sizeRecommendationController = require('../controllers/sizeRecommendationController');

router.post('/', sizeRecommendationController.createSizeRecommendation);
router.get('/user/:userId', sizeRecommendationController.getUserRecommendations);
router.delete('/:id', sizeRecommendationController.deleteSizeRecommendation);

module.exports = router;
