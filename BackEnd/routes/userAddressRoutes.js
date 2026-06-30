const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userAddressController');
const { authenticate, requireSelfOrAdmin } = require('../middleware/auth');

router.get('/user/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), ctrl.getAddresses);
router.post('/', authenticate, requireSelfOrAdmin('body', 'userId'), ctrl.createAddress);
router.put('/:id', authenticate, ctrl.updateAddress);
router.put('/:id/default', authenticate, ctrl.setDefault);
router.delete('/:id', authenticate, ctrl.deleteAddress);

module.exports = router;
