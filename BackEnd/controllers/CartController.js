const { Cart, Product, ProductVariant } = require('../models');

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
        include: [
          {
            model: Product,
            attributes: ['id', 'name', 'price'],
            include: [
              {
                model: ProductVariant,
                as: 'variants',
                attributes: ['size', 'color', 'imageUrl', 'quantity']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      const formattedItems = cartItems.map(item => {
        let price = item.price;
        let imageUrl = item.imageUrl;
        let name = item.name;
        let availableVariants = [];

        if (item.Product) {
          name = item.Product.name;
          price = parseFloat(item.Product.price);

          if (item.Product.variants && item.Product.variants.length > 0) {
            availableVariants = item.Product.variants;
            
            // Find specific variant by color and size
            const variant = item.Product.variants.find(v => 
              v.size === item.size && v.color === item.color
            );

            if (variant && variant.imageUrl) {
              imageUrl = variant.imageUrl;
            } else if (item.Product.variants[0].imageUrl) {
              imageUrl = item.Product.variants[0].imageUrl;
            }
          }
        }

        return {
          id: item.id,
          userId: item.userId,
          productId: item.productId,
          name: name,
          price: price,
          imageUrl: imageUrl,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          availableVariants: availableVariants,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };
      });

      return res.status(200).json({ 
        success: true, 
        cartItems: formattedItems 
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

  // Update cart item (color and size)
  static async updateCartItem(req, res) {
    try {
      const { cartId } = req.params;
      const { color, size } = req.body;

      const cartItem = await Cart.findByPk(cartId);
      if (!cartItem) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cart item not found' 
        });
      }

      // Check if an item with the new color/size already exists for this user and product
      const existingItem = await Cart.findOne({
        where: {
          userId: cartItem.userId,
          productId: cartItem.productId,
          color: color || cartItem.color,
          size: size || cartItem.size
        }
      });

      if (existingItem && existingItem.id !== cartItem.id) {
        // Merge quantities if duplicate exists
        existingItem.quantity += cartItem.quantity;
        await existingItem.save();
        await cartItem.destroy(); // Remove the old item
        
        return res.status(200).json({ 
          success: true, 
          message: 'Cart item merged successfully', 
          cartItem: existingItem 
        });
      } else {
        // Just update attributes
        cartItem.color = color || cartItem.color;
        cartItem.size = size || cartItem.size;
        await cartItem.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Cart item updated successfully', 
          cartItem 
        });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update cart item',
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
