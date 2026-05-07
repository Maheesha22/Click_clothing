
// BackEnd/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchCtrl = require('../controllers/searchController');

// GET /api/search?q=query → Search products by query string
router.get('/', searchCtrl.searchProducts);

module.exports = router;
