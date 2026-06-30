const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), wishlistController.getWishlist);
router.post('/', authenticate, wishlistController.addToWishlist);
router.delete('/by-product/:userId/:productId', authenticate, requireSelfOrAdmin('params', 'userId'), wishlistController.removeFromWishlistByProduct);
router.delete('/:id', authenticate, wishlistController.removeFromWishlist);

module.exports = router;
