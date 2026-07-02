'use strict';

const { Review, Order, OrderItem, Product, ProductVariant, User } = require('../models');

// ─── POST /api/reviews ───────────────────────────────────────────────────────
// Submit a review for one product in a delivered order.
// Accepts multipart/form-data so an image can be uploaded via multer.
const submitReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, productId, color, rating, comment } = req.body;
    const imageUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path) : null;

    // Basic validation
    if (!orderId || !productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'orderId, productId, rating, and comment are required.'
      });
    }

    const ratingInt = parseInt(rating, 10);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5.' });
    }

    // Verify the order belongs to this user and is delivered
    const order = await Order.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status?.toLowerCase() !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review products from delivered orders.'
      });
    }

    // Verify the product is actually in this order
    const orderItem = await OrderItem.findOne({
      where: { orderId, productId }
    });

    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'This product is not part of the specified order.'
      });
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({ where: { userId, orderId, productId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product for this order.'
      });
    }

    // Create the review
    const review = await Review.create({
      userId,
      orderId: parseInt(orderId, 10),
      productId: parseInt(productId, 10),
      color: color || orderItem.color || null,
      rating: ratingInt,
      comment: comment.trim(),
      imageUrls
    });

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Error submitting review:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product for this order.'
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// ─── GET /api/reviews/eligible-orders ────────────────────────────────────────
// Returns all delivered orders for the logged-in user.
// Each order includes its items with product details.
// Also returns which productId+orderId combos already have reviews.
const getDeliveredOrdersForReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { userId, status: 'delivered' },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'Product',
              include: [{ model: ProductVariant, as: 'variants' }]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Fetch all existing reviews by this user so we can mark reviewed products
    const existingReviews = await Review.findAll({
      where: { userId },
      attributes: ['orderId', 'productId']
    });

    // Build a Set of "orderId-productId" strings for O(1) lookup
    const reviewedSet = new Set(
      existingReviews.map(r => `${r.orderId}-${r.productId}`)
    );

    const data = orders.map(order => {
      const o = order.toJSON();
      o.items = (o.items || []).map(item => ({
        ...item,
        alreadyReviewed: reviewedSet.has(`${o.id}-${item.productId}`)
      }));
      return o;
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching eligible orders:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ─── GET /api/reviews/my-reviews ─────────────────────────────────────────────
// Returns all reviews submitted by the logged-in user.
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name'],
          include: [
            {
              model: ProductVariant,
              as: 'variants',
              attributes: ['color', 'imageUrl']
            }
          ]
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

module.exports = {
  submitReview,
  getDeliveredOrdersForReview,
  getUserReviews
};
