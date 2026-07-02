const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getSettings,
  updateSettings
} = require('../controllers/notificationController');

// GET /api/notifications - Get all notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount);

// GET /api/notifications/settings - Get notification settings
router.get('/settings', getSettings);

// PUT /api/notifications/settings - Update notification settings
router.put('/settings', updateSettings);

// PUT /api/notifications/read-all - Mark all as read
// (declared before /:id/read so "read-all" is never matched as an :id)
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/clear-all - Delete all notifications
// (declared before /:id so "clear-all" is never matched as an :id)
router.delete('/clear-all', clearAllNotifications);

// DELETE /api/notifications/:id - Delete one notification
router.delete('/:id', deleteNotification);

module.exports = router;
