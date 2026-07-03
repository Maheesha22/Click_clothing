const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { authenticate, requireAdmin, requireSelfOrAdmin } = require('../middleware/auth');

// Configure multer to upload bank slips directly to Cloudinary
const slipStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'click_clothing_slips',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',  
  },
});

const upload = multer({
  storage: slipStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Order routes
router.post('/create', authenticate, upload.single('bankSlip'), orderController.createOrder);
router.get('/search/verify', orderController.getOrderByNumberAndEmail);
router.get('/user/:userId', authenticate, requireSelfOrAdmin('params', 'userId'), orderController.getUserOrders);
router.post('/:id/upload-slip', upload.single('bankSlip'), orderController.uploadPaymentSlip);
router.get('/track/:barcode', orderController.getOrderByBarcode);
router.get('/test-email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { sendOrderConfirmationEmail } = require('../services/emailService');
    const result = await sendOrderConfirmationEmail({
      email: req.query.email || 'clickclothing.reset@gmail.com',
      customerName: 'Test Customer',
      orderNumber: 'ORD-TEST-1234',
      items: [
        { name: 'Classic T-Shirt', size: 'M', quantity: 2, price: 1500 }
      ],
      subtotal: 3000,
      shipping: 400,
      total: 3400,
      paymentMethod: 'Cash on Delivery',
      address: '123 Main Street',
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western Province',
      paidDate: new Date().toLocaleDateString()
    });
    if (result) {
      res.json({ success: true, message: 'Test confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Nodemailer returned false. Check email_errors.log' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});
router.get('/', authenticate, requireAdmin, orderController.getAllOrders);
// GET /api/orders/revenue-by-status
router.get('/revenue-by-status', authenticate, requireAdmin, orderController.getRevenueByStatus);
router.get('/:id', authenticate, requireAdmin, orderController.getOrderDetails);
router.put('/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);
router.put('/:id/payment', authenticate, requireAdmin, orderController.updatePaymentStatus);

module.exports = router;
