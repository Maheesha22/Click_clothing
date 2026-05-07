
'use strict';
const { Category, Product, ProductVariant, OrderItem, Order } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * GET /api/categories/data/latest-products
 * Returns the latest 4 products with their categories and variants
 * Used for "New Arrivals" section on homepage
 */
exports.getLatestProducts = async (req, res) => {
  try {
    const latestProducts = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'size', 'color', 'quantity', 'imageUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 4,
      attributes: ['id', 'name', 'description', 'price', 'categoryId', 'createdAt']
    });

    // Format the response to match the query structure
    const formattedProducts = latestProducts.map(product => {
      const categoryName = product.category?.name || 'Unknown';
      const variants = product.variants || [];
      
      return {
        productId: product.id,
        productName: product.name,
        description: product.description,
        price: product.price,
        categoryName: categoryName,
        categoryId: product.categoryId,
        variants: variants.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          quantity: v.quantity,
          imageUrl: v.imageUrl
        })),
        createdAt: product.createdAt
      };
    });

    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/category-data/best-sellers
 * Returns the top 4 best-selling products based on order history
 * Only includes products from completed orders (confirmed, shipped, delivered)
 * Includes product details, categories, and variants with images
 */
exports.getBestSellers = async (req, res) => {
  try {
    // Step 1: Get top 4 best-selling products from order_items and orders
    const bestSellingProductIds = await OrderItem.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_sold']
      ],
      include: [
        {
          model: Order,
          attributes: [],
          required: true,
          where: {
            status: {
              [Sequelize.Op.in]: ['confirmed', 'shipped', 'delivered']
            }
          }
        }
      ],
      group: ['productId'],
      order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
      limit: 4,
      raw: true
    });

    // Extract product IDs
    const productIds = bestSellingProductIds.map(item => item.productId);

    if (productIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Step 2: Fetch the product details with variants and categories
    const bestSellingProducts = await Product.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: productIds
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'size', 'color', 'quantity', 'imageUrl']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'categoryId']
    });

    // Step 3: Create a map of total_sold from the first query
    const salesMap = {};
    bestSellingProductIds.forEach(item => {
      salesMap[item.productId] = item.total_sold;
    });

    // Step 4: Format and sort response by total_sold
    const formattedProducts = bestSellingProducts.map(product => {
      const variants = product.variants || [];
      const categoryName = product.category?.name || 'Unknown';
      
      return {
        productId: product.id,
        productName: product.name,
        description: product.description,
        price: product.price,
        categoryName: categoryName,
        categoryId: product.categoryId,
        totalSold: salesMap[product.id] || 0,
        variants: variants.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          quantity: v.quantity,
          imageUrl: v.imageUrl
        }))
      };
    }).sort((a, b) => b.totalSold - a.totalSold);

    res.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
