const { Feedback } = require('../models');
const { notifyNewFeedback } = require('../services/notificationService');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const feedback = await Feedback.create({
      name,
      email,
      message
    });

    // Notify admin
    try {
      await notifyNewFeedback(feedback);
    } catch (notifErr) {
      console.error('Failed to notify admin of new feedback:', notifErr);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error creating feedback' });
  }
};

// Get recent public feedbacks (Limit 5)
exports.getPublicFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.status(200).json(feedbacks); // Note: FeedbackForm.jsx expects array directly from res.data, not inside success/data wrapper
  } catch (error) {
    console.error('Get public feedbacks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching feedbacks' });
  }
};

// Get all feedbacks for Admin
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching feedbacks' });
  }
};

// Delete feedback (Admin)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCount = await Feedback.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting feedback' });
  }
};
