const { Cart } = require('../models');

class CartController {
  // Add item to cart
  static async addToCart(req, res) {
    try {
      const { userId, productId, name, price, imageUrl, color, size, quantity } = req.body;

      // Validate required fields
      if (!userId || !productId || !name || !price) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }

      // Check if item already exists in cart
      const existingItem = await Cart.findOne({
        where: {
          userId,
          productId,
          color: color || null,
          size: size || null
        }
      });

      if (existingItem) {
        // Update quantity if exists
        existingItem.quantity += quantity || 1;
        await existingItem.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Cart updated successfully',
          cartItem: existingItem
        });
      } else {
        // Create new cart item
        const cartItem = await Cart.create({
          userId,
          productId,
          name,
          price,
          imageUrl: imageUrl || '',
          color: color || '',
          size: size || '',
          quantity: quantity || 1
        });
        
        return res.status(201).json({ 
          success: true, 
          message: 'Item added to cart',
          cartItem
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add item to cart',
        error: error.message 
      });
    }
  }

  // Get user's cart items
  static async getCart(req, res) {
    try {
      const { userId } = req.params;
      
      const cartItems = await Cart.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({ 
        success: true, 
        cartItems 
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch cart items',
        error: error.message 
      });
    }
  }

  // Update cart item quantity
  static async updateQuantity(req, res) {
    try {
      const { cartId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid quantity' 
        });
      }

      const cartItem = await Cart.findByPk(cartId);
      if (!cartItem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart item not found' 
        });
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Quantity updated successfully',
        cartItem
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update cart item',
        error: error.message 
      });
    }
  }

  // Remove item from cart
  static async removeFromCart(req, res) {
    try {
      const { cartId } = req.params;
      
      const cartItem = await Cart.findByPk(cartId);
      if (!cartItem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart item not found' 
        });
      }

      await cartItem.destroy();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to remove item from cart',
        error: error.message 
      });
    }
  }

  // Clear user's entire cart
  static async clearCart(req, res) {
    try {
      const { userId } = req.params;
      
      await Cart.destroy({ where: { userId } });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to clear cart',
        error: error.message 
      });
    }
  }
}

module.exports = CartController;