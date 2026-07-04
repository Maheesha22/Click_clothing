/**
 * NOTIFICATION SERVICE
 * ─────────────────────────────────────────────────────────────
 * Central place that creates admin-dashboard notifications and
 * checks them against the saved NotificationSetting before
 * writing them to MySQL. Every notification is stored in the
 * `notifications` table (no in-memory/local-storage state).
 *
 * This app has no real authentication/session layer (no JWT,
 * no req.user), so the admin dashboard is treated as a single
 * shared workspace: notifications are broadcast (user_id: null)
 * and settings are kept on the first admin (isAdmin: true)
 * account found in the `users` table. That id is resolved once
 * and cached so we don't hit the DB on every event.
 * ─────────────────────────────────────────────────────────────
 */

const { Notification, NotificationSetting, User } = require('../models');

// Low stock threshold — kept identical to the value already used
// by dashboardController.js so both features agree on what "low" means.
const LOW_STOCK_THRESHOLD = 5;

// Maps a notification "type" to the matching NotificationSetting column.
// 'return' has no dedicated toggle in the Settings page/table, so
// return-request notifications are always sent.
const TYPE_TO_SETTING = {
  order: 'new_order_alerts',
  stock: 'low_stock_alerts',
  payment: 'payment_failures',
  signup: 'customer_signups',
  review: 'new_reviews_feedbacks',
  feedback: 'new_reviews_feedbacks'
};

let cachedAdminId = null;

/**
 * Resolve the admin account that owns the NotificationSetting row.
 * Prefers a real isAdmin=true user; falls back to the first user
 * in the table so the feature still works on a fresh/dev database.
 */
const resolveAdminUserId = async () => {
  if (cachedAdminId) return cachedAdminId;

  let admin = await User.findOne({
    where: { isAdmin: true },
    order: [['id', 'ASC']]
  });

  if (!admin) {
    admin = await User.findOne({ order: [['id', 'ASC']] });
  }

  if (!admin) {
    return null; // No user exists yet in the database at all.
  }

  cachedAdminId = admin.id;
  return cachedAdminId;
};

/**
 * Fetch (creating with defaults if missing) the single settings
 * row used by the admin dashboard.
 */
const getOrCreateSettings = async () => {
  const adminId = await resolveAdminUserId();
  if (!adminId) return null;

  const [settings] = await NotificationSetting.findOrCreate({
    where: { user_id: adminId },
    defaults: {
      user_id: adminId,
      new_order_alerts: true,
      low_stock_alerts: true,
      payment_failures: true,
      weekly_reports: true,
      customer_signups: false,
      new_reviews_feedbacks: true
    }
  });

  return settings;
};

/**
 * Returns true if this type of notification is allowed to fire,
 * based on the saved settings. Types without a matching column
 * (e.g. 'return') are always allowed.
 */
const isTypeEnabled = async (type) => {
  const settingKey = TYPE_TO_SETTING[type];
  if (!settingKey) return true;

  const settings = await getOrCreateSettings();
  if (!settings) return true; // No admin/settings yet — don't block notifications.

  return settings[settingKey] !== false;
};

/**
 * Low-level writer: checks settings, then inserts a row into
 * the notifications table. Returns null (and logs) on any error
 * so a notification failure never breaks the calling feature
 * (e.g. placing an order must always succeed even if the
 * notification insert fails).
 */
const createSystemNotification = async ({ type, title, message, data = null }) => {
  try {
    const enabled = await isTypeEnabled(type);
    if (!enabled) {
      console.log(`[Notification] Skipped "${type}" — disabled in settings`);
      return null;
    }

    const notification = await Notification.create({
      user_id: null, // broadcast to the admin dashboard
      type,
      title,
      message,
      data,
      is_read: false,
      is_sent: true,
      sent_at: new Date()
    });

    console.log(`[Notification] Created (${type}): ${title}`);
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error);
    return null;
  }
};

/* ═══════════════════════════════════════════════════════════
   EVENT HELPERS — one per trigger point used by the controllers
═══════════════════════════════════════════════════════════ */

// New order placed
const notifyNewOrder = async (order) => {
  return createSystemNotification({
    type: 'order',
    title: '🛒 New Order Received',
    message: `Order ${order.order_number} has been placed (Rs ${Number(order.total_bill).toFixed(2)})`,
    data: { orderId: order.id, orderNumber: order.order_number }
  });
};

// Payment marked as failed by admin (or automatically)
const notifyPaymentFailure = async (order) => {
  return createSystemNotification({
    type: 'payment',
    title: '💳 Payment Failed',
    message: `Payment for order ${order.order_number} has failed`,
    data: { orderId: order.id, orderNumber: order.order_number }
  });
};

// New customer account registered
const notifyNewCustomerSignup = async (user) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  return createSystemNotification({
    type: 'signup',
    title: '👤 New Customer Sign-up',
    message: `${name} just created an account`,
    data: { userId: user.id, email: user.email }
  });
};

// New return request submitted
const notifyNewReturn = async (returnRecord, orderNumber) => {
  return createSystemNotification({
    type: 'return',
    title: '↩️ New Return Request',
    message: orderNumber
      ? `A return request was submitted for order ${orderNumber}`
      : `A new return request was submitted (#${returnRecord.id})`,
    data: { returnId: returnRecord.id, orderId: returnRecord.orderId }
  });
};

/**
 * Low stock — deduped so the same variant doesn't spam a new
 * notification on every order while it stays under the threshold.
 * A fresh notification is only created if there is no existing
 * UNREAD low-stock notification for this exact variant.
 */
const notifyLowStock = async (variant, product) => {
  if (variant.quantity > LOW_STOCK_THRESHOLD) return null;

  try {
    const enabled = await isTypeEnabled('stock');
    if (!enabled) return null;

    // Don't spam — only notify once per variant while it remains unread.
    const unreadStockAlerts = await Notification.findAll({
      where: { type: 'stock', is_read: false }
    });
    const alreadyNotified = unreadStockAlerts.some(n => n.data && n.data.variantId === variant.id);
    if (alreadyNotified) return null;

    return createSystemNotification({
      type: 'stock',
      title: '📦 Low Stock Alert',
      message: `${product?.name || 'Product'} (${variant.size}/${variant.color}) has only ${variant.quantity} unit(s) left`,
      data: { variantId: variant.id, productId: variant.productId, quantity: variant.quantity }
    });
  } catch (error) {
    console.error('[NotificationService] Low stock check failed:', error);
    return null;
  }
};

// New product review submitted
const notifyNewReview = async (review, product, user) => {
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer' : 'Customer';
  const productName = product ? product.name : 'a product';
  return createSystemNotification({
    type: 'review',
    title: '⭐ New Product Review',
    message: `${userName} left a ${review.rating}-star review for ${productName}`,
    data: { reviewId: review.id, productId: review.productId, rating: review.rating }
  });
};

// New customer feedback submitted
const notifyNewFeedback = async (feedback) => {
  return createSystemNotification({
    type: 'feedback',
    title: '💬 New Customer Feedback',
    message: `${feedback.name} submitted new feedback`,
    data: { feedbackId: feedback.id, email: feedback.email }
  });
};

module.exports = {
  resolveAdminUserId, 
  getOrCreateSettings,
  createSystemNotification,
  notifyNewOrder,
  notifyPaymentFailure,
  notifyNewCustomerSignup,
  notifyNewReturn,
  notifyLowStock,
  notifyNewReview,
  notifyNewFeedback,
  LOW_STOCK_THRESHOLD
};
