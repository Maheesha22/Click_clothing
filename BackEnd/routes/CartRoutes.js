const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

// Cart routes
router.post('/add', authenticate, CartController.addToCart);
router.get('/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), CartController.getCart);
router.put('/update/:cartId', authenticate, CartController.updateQuantity);
router.put('/update-item/:cartId', authenticate, CartController.updateCartItem);
router.delete('/remove/:cartId', authenticate, CartController.removeFromCart);
router.delete('/clear/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), CartController.clearCart);

module.exports = router;
