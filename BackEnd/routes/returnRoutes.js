const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { authenticate, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');

//used
router.get('/eligible-orders', authenticate, returnController.getEligibleOrdersForReturns);

// used
router.post('/multi-product', authenticate, returnController.createMultiProductReturn);

// used
router.get('/stats', authenticate, requireAdmin, returnController.getReturnsStats);

router.get('/date-range', authenticate, requireAdmin, returnController.getReturnsByDateRange);

router.get('/user/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), returnController.getUserReturns);

// used
router.get('/', authenticate, requireAdmin, returnController.getAllReturns);

router.get('/:id', authenticate, returnController.getReturnById);

router.post('/create', authenticate, returnController.createReturn);

router.put('/:id', authenticate, requireAdmin, returnController.updateReturn);

// used 
router.delete('/:id', authenticate, requireAdmin, returnController.deleteReturn);

module.exports = router;
