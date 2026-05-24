const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userAddressController');

router.get('/user/:userId', ctrl.getAddresses);
router.post('/', ctrl.createAddress);
router.put('/:id', ctrl.updateAddress);
router.put('/:id/default', ctrl.setDefault);
router.delete('/:id', ctrl.deleteAddress);

module.exports = router;
