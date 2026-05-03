const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

// Cart routes
router.post('/add', CartController.addToCart);
router.get('/:userId', CartController.getCart);
router.put('/update/:cartId', CartController.updateQuantity);
router.delete('/remove/:cartId', CartController.removeFromCart);
router.delete('/clear/:userId', CartController.clearCart);

module.exports = router;