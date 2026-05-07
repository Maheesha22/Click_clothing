
// BackEnd/routes/categoryDataRoutes.js
const express = require('express');
const router = express.Router();
const dataCtrl = require('../controllers/categoryDataController');

// GET  /api/category-data/latest-products  → latest 4 products for "New Arrivals"
router.get('/latest-products', dataCtrl.getLatestProducts);

// GET  /api/category-data/best-sellers  → top 4 best-selling products for "Best Sellers"
router.get('/best-sellers', dataCtrl.getBestSellers);

module.exports = router;
