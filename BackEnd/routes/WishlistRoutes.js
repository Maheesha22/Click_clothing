const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

router.get('/:userId', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/by-product/:userId/:productId', wishlistController.removeFromWishlistByProduct);
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
