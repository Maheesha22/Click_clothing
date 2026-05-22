'use strict';
const { Product, Category, ProductVariant } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * Returns 4 random products for the "You May Also Like" section
 */
exports.getRecommendations = async (req, res) => {
    try {
        const products = await Product.findAll({
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
            attributes: ['id', 'name', 'description', 'price', 'categoryId'],
            limit: 4,
            order: Sequelize.literal('RAND()')
        });

        // Format the response for frontend
        const formattedResults = products.map(product => {
            const variants = product.variants || [];
            const categoryName = product.category?.name || 'Unknown';
            const uniqueColors = [...new Set(variants.map(v => v.color))];
            const uniqueSizes = [...new Set(variants.map(v => v.size))];
            const colorImages = {};
            uniqueColors.forEach(color => {
              const variant = variants.find(v => v.color === color && v.imageUrl);
              if (variant) {
                colorImages[color] = variant.imageUrl;
              }
            });
            const firstImage = variants[0]?.imageUrl || '/trousers/default.jpeg';

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: parseFloat(product.price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                category: categoryName,
                categoryId: product.categoryId,
                colors: uniqueColors,
                sizes: uniqueSizes,
                colorImages: colorImages,
                defaultImage: firstImage,
                img: firstImage
            };
        });

        res.json({ success: true, data: formattedResults });
    } catch (error) {
        console.error('Error fetching You May Also Like recommendations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
