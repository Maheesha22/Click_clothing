const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Builds a SQL WHERE clause fragment for date filtering.
 * Supports: today | week | month | alltime | custom
 */
function dateFilter(period, start, end, col = 'createdAt') {
  switch (period) {
    case 'today':
      return {
        clause: `DATE(${col}) = CURDATE()`,
        label:  'Today',
      };
    case 'week':
      return {
        clause: `${col} >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
        label:  'This Week',
      };
    case 'month':
      return {
        clause: `MONTH(${col}) = MONTH(CURDATE()) AND YEAR(${col}) = YEAR(CURDATE())`,
        label:  'This Month',
      };
    case 'alltime':
      return { clause: '1=1', label: 'All Time' };
    case 'custom':
      if (!start || !end) throw new Error('custom period requires start and end dates');
      return {
        clause: `DATE(${col}) BETWEEN '${start}' AND '${end}'`,
        label:  `${start} – ${end}`,
      };
    default:
      return { clause: '1=1', label: 'All Time' };
  }
}

/**
 * GET /api/reports/analytics
 *
 * Query params:
 *   period  = today | week | month | alltime | custom  (default: alltime)
 *   start   = YYYY-MM-DD  (only when period=custom)
 *   end     = YYYY-MM-DD  (only when period=custom)
 */
const getReportAnalytics = async (req, res) => {
  try {
    const { period = 'alltime', start, end } = req.query;

    const { clause, label } = dateFilter(period, start, end);

    /* ── 1. Revenue
       Real DB: payment_status is mixed case ('PAID', 'Confirmed', 'PENDING').
       Treat 'Confirmed' as paid since that means payment was accepted.
       Use UPPER() to normalise across all cases.
    ── */
    const [revenueRow] = await sequelize.query(
      `SELECT CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue
       FROM orders
       WHERE ${clause}
         AND UPPER(payment_status) IN ('PAID', 'CONFIRMED')`,
      { type: QueryTypes.SELECT }
    );
    const revenue = Number(revenueRow.revenue);

    /* ── 2. Orders ── */
    const [ordersRow] = await sequelize.query(
      `SELECT COUNT(*) AS orders FROM orders WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );
    const orders = Number(ordersRow.orders);

    /* ── 3. New Customers ── */
    const [custRow] = await sequelize.query(
      `SELECT COUNT(*) AS newCustomers FROM customers WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );
    const newCustomers = Number(custRow.newCustomers);

    /* ── 4. Return Rate — returns / orders × 100 ── */
    const [returnRow] = await sequelize.query(
      `SELECT COUNT(*) AS returnCount FROM returns WHERE ${clause}`,
      { type: QueryTypes.SELECT }
    );
    const returnCount = Number(returnRow.returnCount);
    const returnRate = orders > 0
      ? parseFloat(((returnCount / orders) * 100).toFixed(1))
      : 0;

    /* ── 5. Sales Chart — revenue per day
       FIX: group & order only on DATE(createdAt) — a deterministic expression.
       DAYNAME is derived from DATE so it's safe to SELECT but must NOT be
       in GROUP BY (that would violate ONLY_FULL_GROUP_BY if the engine
       treats them as separate non-deterministic columns).
       We add DAYNAME inside DATE_FORMAT so it comes from the same grouped
       expression, or simply compute it via DATE_FORMAT on the grouped key.
    ── */
    const salesChart = await sequelize.query(
      `SELECT
         DATE(createdAt)                          AS day,
         DATE_FORMAT(DATE(createdAt), '%a')       AS dayName,
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue,
         COUNT(*)                                 AS orderCount
       FROM orders
       WHERE ${clause}
       GROUP BY DATE(createdAt)
       ORDER BY DATE(createdAt) ASC`,
      { type: QueryTypes.SELECT }
    );

    /* ── 6. Top Products (by units sold)
       FIX: replace createdAt references properly using a named alias subquery
       approach so the WHERE clause targets o.createdAt unambiguously.
    ── */
    const orderClause = dateFilter(period, start, end, 'o.createdAt').clause;
    const topProducts = await sequelize.query(
      `SELECT
         p.name,
         SUM(oi.quantity) AS units
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       JOIN orders   o ON oi.orderId   = o.id
       WHERE ${orderClause}
       GROUP BY p.id, p.name
       ORDER BY units DESC
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    /* ── 7. Customer Growth — new customers by month (last 7 months)
       FIX (ONLY_FULL_GROUP_BY): every non-aggregated SELECT expression must
       appear in GROUP BY. We group on YEAR+MONTH integers (deterministic) and
       derive the display label via MIN(createdAt) — which IS aggregated — or
       by wrapping the format string in the same grouped expressions.

       Safest pattern: GROUP BY yr, mo, then derive label from those integers
       using CONCAT + MONTHNAME on a date built from them.
    ── */
    const customerGrowth = await sequelize.query(
      `SELECT
         YEAR(createdAt)                                      AS yr,
         MONTH(createdAt)                                     AS mo,
         DATE_FORMAT(MIN(createdAt), '%b')                   AS month,
         COUNT(*)                                             AS newCustomers
       FROM customers
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)
       GROUP BY YEAR(createdAt), MONTH(createdAt)
       ORDER BY yr ASC, mo ASC`,
      { type: QueryTypes.SELECT }
    );

    /* ── 8. Payment Summary
       FIX: normalise payment_status with UPPER() so 'PAID', 'Paid', 'paid'
       all match. Group by the normalised value to avoid duplicate buckets.
    ── */
    const paymentRows = await sequelize.query(
      `SELECT
         UPPER(payment_status)                                AS status,
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS amount,
         COUNT(*)                                             AS cnt
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
      // 'CONFIRMED' = payment accepted → count as paid in summary
      if (key === 'PAID' || key === 'CONFIRMED') paymentSummary.paid    += amt;
      else if (key === 'PENDING')                 paymentSummary.pending += amt;
      else if (key === 'FAILED')                  paymentSummary.failed  += amt;
    });
    paymentSummary.total   = parseFloat(paymentSummary.total.toFixed(2));
    paymentSummary.paid    = parseFloat(paymentSummary.paid.toFixed(2));
    paymentSummary.pending = parseFloat(paymentSummary.pending.toFixed(2));
    paymentSummary.failed  = parseFloat(paymentSummary.failed.toFixed(2));

    return res.status(200).json({
      success: true,
      period:  label,
      data: {
        revenue,
        orders,
        newCustomers,
        returnRate,
        salesChart,
        topProducts,
        customerGrowth,
        paymentSummary,
      },
    });
  } catch (error) {
    console.error('SERVER ERROR [getReportAnalytics]:', error);
    return res.status(500).json({
      success: false,
      message: 'Reports data error: ' + error.message,
    });
  }
};

module.exports = { getReportAnalytics };
