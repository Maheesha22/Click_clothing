/**
 * NOTIFICATION CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * Powers the admin dashboard notification bell + Settings page.
 * There is no auth/session layer in this app (no JWT, no
 * req.user), so notifications are treated as a shared admin
 * dashboard feed (user_id: null) while the on/off settings are
 * kept on the resolved admin account — see notificationService.js
 * for details.
 * ─────────────────────────────────────────────────────────────
 */

const { Notification, NotificationSetting } = require('../models');
const {
  getOrCreateSettings,
  resolveAdminUserId
} = require('../services/notificationService');

// ============================================
// GET NOTIFICATIONS
// ============================================
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: null },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      is_read: n.is_read,
      created_at: n.created_at,
      time_ago: getTimeAgo(n.created_at)
    }));

    const unreadCount = await Notification.count({
      where: { user_id: null, is_read: false }
    });

    res.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        unreadCount,
        total: formattedNotifications.length
      }
    });

  } catch (error) {
    console.error('[getNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET UNREAD COUNT
// ============================================
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.count({
      where: { user_id: null, is_read: false }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('[getUnreadCount] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// MARK AS READ
// ============================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { is_read: true },
      { where: { id, user_id: null } }
    );

    res.json({
      success: true,
      message: 'Marked as read'
    });

  } catch (error) {
    console.error('[markAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// MARK ALL AS READ
// ============================================
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: null, is_read: false } }
    );

    res.json({
      success: true,
      message: 'All marked as read'
    });

  } catch (error) {
    console.error('[markAllAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE NOTIFICATION
// ============================================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.destroy({
      where: { id, user_id: null }
    });

    res.json({
      success: true,
      message: 'Deleted'
    });

  } catch (error) {
    console.error('[deleteNotification] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// CLEAR ALL NOTIFICATIONS
// ============================================
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.destroy({ where: { user_id: null } });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });

  } catch (error) {
    console.error('[clearAllNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET SETTINGS
// ============================================
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No admin account exists yet — create/login as an admin first.'
      });
    }

    res.json({
      success: true,
      data: {
        new_order_alerts: settings.new_order_alerts,
        low_stock_alerts: settings.low_stock_alerts,
        payment_failures: settings.payment_failures,
        weekly_reports: settings.weekly_reports,
        customer_signups: settings.customer_signups
      }
    });

  } catch (error) {
    console.error('[getSettings] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE SETTINGS
// ============================================
const updateSettings = async (req, res) => {
  try {
    const adminId = await resolveAdminUserId();

    if (!adminId) {
      return res.status(404).json({
        success: false,
        message: 'No admin account exists yet — create/login as an admin first.'
      });
    }

    const {
      new_order_alerts,
      low_stock_alerts,
      payment_failures,
      weekly_reports,
      customer_signups
    } = req.body;

    const [settings] = await NotificationSetting.findOrCreate({
      where: { user_id: adminId },
      defaults: {
        user_id: adminId,
        new_order_alerts: true,
        low_stock_alerts: true,
        payment_failures: true,
        weekly_reports: true,
        customer_signups: false
      }
    });

    await settings.update({
      new_order_alerts,
      low_stock_alerts,
      payment_failures,
      weekly_reports,
      customer_signups
    });

    res.json({
      success: true,
      message: 'Settings updated',
      data: {
        new_order_alerts: settings.new_order_alerts,
        low_stock_alerts: settings.low_stock_alerts,
        payment_failures: settings.payment_failures,
        weekly_reports: settings.weekly_reports,
        customer_signups: settings.customer_signups
      }
    });

  } catch (error) {
    console.error('[updateSettings] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// HELPER: Get time ago
// ============================================
function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return Math.floor(diff / 604800) + ' weeks ago';
} 

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getSettings,
  updateSettings
};
