/**
 * reportController.js  — Click Clothing Admin
 * COMPLETE WORKING VERSION
 */

'use strict';

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/* ═══════════════════════════════════════════════════════════
   DATE FILTER HELPER
═══════════════════════════════════════════════════════════ */
function dateFilter(period, start, end, col = 'createdAt') {
  switch (period) {
    case 'today':
      return {
        clause: `DATE(${col}) = CURDATE()`,
        label: 'Today',
      };
    case 'week':
      return {
        clause: `${col} >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        label: 'This Week',
      };
    case 'month':
      return {
        clause: `MONTH(${col}) = MONTH(CURDATE()) AND YEAR(${col}) = YEAR(CURDATE())`,
        label: 'This Month',
      };
    case 'alltime':
      return { clause: '1=1', label: 'All Time' };
    case 'custom':
      if (!start || !end) {
        throw new Error('Custom period requires both start and end dates.');
      }
      return {
        clause: `DATE(${col}) BETWEEN '${start}' AND '${end}'`,
        label: `${start} – ${end}`,
      };
    default:
      return { clause: '1=1', label: 'All Time' };
  }
}

/* ═══════════════════════════════════════════════════════════
   GET /api/reports/analytics
═══════════════════════════════════════════════════════════ */
const getReportAnalytics = async (req, res) => {
  try {
    const { period = 'alltime', start, end } = req.query;
    const { clause, label } = dateFilter(period, start, end);

    console.log(`[REPORT] Fetching analytics for period: ${period}, clause: ${clause}`);

    /* ── 1. Revenue ── */
    const [revenueRow] = await sequelize.query(
      `SELECT
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue
       FROM orders
       WHERE ${clause}
         AND UPPER(payment_status) IN ('PAID', 'CONFIRMED')`,
      { type: QueryTypes.SELECT }
    );

    /* ── 2. Total orders ── */
    const [ordersRow] = await sequelize.query(
      `SELECT COUNT(*) AS orders
       FROM orders
       WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );

    /* ── 3. New customers ── */
    const [custRow] = await sequelize.query(
      `SELECT COUNT(*) AS newCustomers
       FROM customers
       WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );

    /* ── 4. Returns count ── */
    const [returnRow] = await sequelize.query(
      `SELECT COUNT(*) AS returnCount
       FROM \`returns\`
       WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );

    const orderCount  = Number(ordersRow.orders);
    const returnCount = Number(returnRow.returnCount);
    const returnRate  = orderCount > 0
      ? parseFloat(((returnCount / orderCount) * 100).toFixed(1))
      : 0;

    /* ── 5. Sales Chart ── */
    const salesChart = await sequelize.query(
      `SELECT
         DATE(createdAt) AS day,
         DATE_FORMAT(MIN(createdAt), '%a') AS dayName,
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue,
         COUNT(*) AS orderCount
       FROM orders
       WHERE ${clause}
       GROUP BY DATE(createdAt)
       ORDER BY DATE(createdAt) ASC`,
      { type: QueryTypes.SELECT }
    );

    /* ── 6. Top 5 selling products ── */
    const oClause = dateFilter(period, start, end, 'o.createdAt').clause;
    const topProducts = await sequelize.query(
      `SELECT
         p.name,
         SUM(oi.quantity) AS units
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       JOIN orders o ON oi.orderId = o.id
       WHERE ${oClause}
         AND UPPER(o.payment_status) IN ('PAID', 'CONFIRMED')
       GROUP BY p.id, p.name
       ORDER BY units DESC
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    /* ── 7. Customer growth ── */
    const customerGrowth = await sequelize.query(
      `SELECT
         YEAR(createdAt) AS yr,
         MONTH(createdAt) AS mo,
         DATE_FORMAT(MIN(createdAt), '%b') AS month,
         COUNT(*) AS newCustomers
       FROM customers
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)
       GROUP BY YEAR(createdAt), MONTH(createdAt)
       ORDER BY yr ASC, mo ASC`,
      { type: QueryTypes.SELECT }
    );

    /* ── 8. Payments Summary ── */
    const paymentRows = await sequelize.query(
      `SELECT
         UPPER(payment_status) AS status,
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS amount,
         COUNT(*) AS cnt
       FROM orders
       WHERE ${clause}
       GROUP BY UPPER(payment_status)`,
      { type: QueryTypes.SELECT }
    );

    const paymentSummary = { paid: 0, pending: 0, failed: 0, total: 0 };
    paymentRows.forEach(r => {
      const amt = Number(r.amount);
      paymentSummary.total += amt;
      const key = (r.status ?? '').toUpperCase();
      if (key === 'PAID' || key === 'CONFIRMED') {
        paymentSummary.paid += amt;
      } else if (key === 'PENDING') {
        paymentSummary.pending += amt;
      } else if (['FAILED', 'CANCELLED', 'DECLINED'].includes(key)) {
        paymentSummary.failed += amt;
      } else {
        paymentSummary.failed += amt;
      }
    });
    paymentSummary.total = parseFloat(paymentSummary.total.toFixed(2));
    paymentSummary.paid = parseFloat(paymentSummary.paid.toFixed(2));
    paymentSummary.pending = parseFloat(paymentSummary.pending.toFixed(2));
    paymentSummary.failed = parseFloat(paymentSummary.failed.toFixed(2));

    // Debug log
    console.log('[REPORT] Data found:', {
      revenue: revenueRow.revenue,
      orders: orderCount,
      newCustomers: custRow.newCustomers,
      salesChartCount: salesChart.length,
      topProductsCount: topProducts.length,
    });

    return res.status(200).json({
      success: true,
      period: label,
      data: {
        revenue: Number(revenueRow.revenue),
        orders: orderCount,
        newCustomers: Number(custRow.newCustomers),
        returnRate,
        salesChart,
        topProducts,
        customerGrowth,
        paymentSummary,
      },
    });

  } catch (err) {
    console.error('[getReportAnalytics] ERROR:', err.message);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ═══════════════════════════════════════════════════════════
   GET /api/reports/export-csv
═══════════════════════════════════════════════════════════ */
const exportCsv = async (req, res) => {
  try {
    const { period = 'alltime', start, end } = req.query;
    const { clause } = dateFilter(period, start, end, 'o.createdAt');

    const rows = await sequelize.query(
      `SELECT
         o.order_number,
         TRIM(CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, ''))) AS customer_name,
         o.status,
         o.payment_method,
         o.payment_status,
         CAST(o.total_bill AS DECIMAL(12,2)) AS total_bill,
         DATE_FORMAT(o.createdAt, '%Y-%m-%d %H:%i:%s') AS created_at
       FROM orders o
       LEFT JOIN customers c ON c.userId = o.userId
       WHERE ${clause}
       ORDER BY o.createdAt DESC`,
      { type: QueryTypes.SELECT }
    );

    const header = 'Order Number,Customer Name,Status,Payment Method,Payment Status,Total Bill,Date\n';
    const body = rows.map(r => [
      r.order_number,
      `"${(r.customer_name || 'Guest').trim() || 'Guest'}"`,
      r.status,
      r.payment_method,
      r.payment_status,
      r.total_bill,
      r.created_at,
    ].join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-report-${Date.now()}.csv"`);
    return res.send(header + body);

  } catch (err) {
    console.error('[exportCsv] ERROR:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   GET /api/reports/export-pdf
═══════════════════════════════════════════════════════════ */
const exportPdf = async (req, res) => {
  try {
    const { period = 'alltime', start, end } = req.query;
    const { clause, label } = dateFilter(period, start, end, 'o.createdAt');

    const rows = await sequelize.query(
      `SELECT
         o.order_number,
         TRIM(CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, ''))) AS customer_name,
         o.status,
         o.payment_method,
         o.payment_status,
         CAST(o.total_bill AS DECIMAL(12,2)) AS total_bill,
         DATE_FORMAT(o.createdAt, '%Y-%m-%d') AS created_at
       FROM orders o
       LEFT JOIN customers c ON c.userId = o.userId
       WHERE ${clause}
       ORDER BY o.createdAt DESC`,
      { type: QueryTypes.SELECT }
    );

    const totalRevenue = rows
      .filter(r => ['PAID', 'CONFIRMED'].includes((r.payment_status || '').toUpperCase()))
      .reduce((sum, r) => sum + Number(r.total_bill), 0);

    const badge = status => {
      const map = {
        pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
        delivered: '#10b981', cancelled: '#ef4444',
      };
      const bg = map[status?.toLowerCase()] || '#6b7280';
      return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${status}</span>`;
    };

    const tableRows = rows.length
      ? rows.map(r => `<tr>
          <td>${r.order_number}</td>
          <td>${(r.customer_name || 'Guest').trim() || 'Guest'}</td>
          <td>${badge(r.status)}</td>
          <td>${r.payment_method}</td>
          <td style="font-weight:700">Rs ${Number(r.total_bill).toLocaleString()}</td>
          <td>${r.created_at}</td>
        </tr>`).join('')
      : `<tr><td colspan="6" style="text-align:center;color:#999;padding:24px">No orders for this period</td></tr>`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Click Clothing — Orders Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 32px; }
  .hdr { border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
  .meta { font-size: 12px; color: #666; text-align: right; }
  .summary { display: flex; gap: 24px; margin-bottom: 28px; }
  .kpi { background: #f5f5f5; border-radius: 8px; padding: 14px 20px; }
  .kpi-val { font-size: 22px; font-weight: 800; }
  .kpi-lbl { font-size: 11px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #111; color: #fff; padding: 10px 12px; text-align: left; font-weight: 700; font-size: 11px; letter-spacing: 0.05em; }
  td { padding: 9px 12px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #fafafa; }
  .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="hdr">
  <div>
    <div class="brand">Click Clothing</div>
    <div style="font-size:13px;color:#555;margin-top:4px">Orders Report</div>
  </div>
  <div class="meta">
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">Period: ${label}</div>
    <div>Generated: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}</div>
  </div>
</div>
<div class="summary">
  <div class="kpi"><div class="kpi-val">${rows.length}</div><div class="kpi-lbl">Total Orders</div></div>
  <div class="kpi"><div class="kpi-val">Rs ${totalRevenue.toLocaleString()}</div><div class="kpi-lbl">Confirmed Revenue</div></div>
</div>
<table>
  <thead>
    <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Payment Method</th><th>Total</th><th>Date</th></tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">Click Clothing Admin — Confidential</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);

  } catch (err) {
    console.error('[exportPdf] ERROR:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getReportAnalytics, exportCsv, exportPdf };
