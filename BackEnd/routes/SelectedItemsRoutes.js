const express = require('express');
const router = express.Router();
const SelectedItemsController = require('../controllers/SelectedItemsController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

// Routes for selected items
router.post('/save', authenticate, requireSelfOrAdmin('body', 'userId'), SelectedItemsController.saveSelectedItems);
router.get('/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), SelectedItemsController.getSelectedItems);

module.exports = router;
