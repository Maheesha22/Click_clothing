// BackEnd/routes/categoryRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoryController');

// GET  /api/categories              → list all with product counts
// POST /api/categories              → create new category
router.route('/')
  .get(ctrl.getAllCategories)
  .post(ctrl.createCategory);

// GET    /api/categories/:id/products  → products + variants in category
router.get('/:id/products', ctrl.getProductsByCategory);

// PUT    /api/categories/:id        → rename category
// DELETE /api/categories/:id        → delete (only if empty)
router.route('/:id')
  .put(ctrl.updateCategory)
  .delete(ctrl.deleteCategory);

module.exports = router;
