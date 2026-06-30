const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public route - Submit contact form
router.post('/submit', contactController.submitContactForm);

router.get('/submissions', authenticate, requireAdmin, contactController.getAllSubmissions);
router.get('/submissions/:id', authenticate, requireAdmin, contactController.getSubmissionById);
router.delete('/submissions/:id', authenticate, requireAdmin, contactController.deleteSubmission);

module.exports = router;
