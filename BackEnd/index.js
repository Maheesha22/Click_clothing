require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/CartRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const categoryDataRoutes = require('./routes/categoryDataRoutes');
const searchRoutes = require('./routes/searchRoutes');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
const youMayAlsoLikeRoutes = require('./routes/youMayAlsoLikeRoutes');
const wishlistRoutes = require('./routes/WishlistRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');
const bankDetailRoutes = require('./routes/bankDetailRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');
const returnRoutes = require('./routes/returnRoutes');
const adminCustomerRoutes = require('./routes/adminCustomerRoutes');
const selectedItemsRoutes = require('./routes/SelectedItemsRoutes');
const userAddressRoutes = require('./routes/userAddressRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require("./routes/notificationRoutes");

const db = require('./models');

const parseCorsOrigin = (originEnv) => {
  if (!originEnv) return '*'; // fallback to allow all if not configured
  if (originEnv === '*') return true;
  const origins = originEnv.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

const isLocalOrigin = (origin) =>
  /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const addLocalDevOrigins = (originConf) => {
  if (originConf === true || originConf === '*') return originConf;
  const origins = Array.isArray(originConf) ? [...originConf] : [originConf];
  const localDevOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ];

  if (origins.some(isLocalOrigin)) {
    localDevOrigins.forEach((devOrigin) => {
      if (!origins.includes(devOrigin)) origins.push(devOrigin);
    });
  }

  return origins.length === 1 ? origins[0] : origins;
};

const port = Number(process.env.PORT) || 3000;
let corsOrigin = parseCorsOrigin(process.env.CORS_ORIGIN || process.env.FRONTEND_URL);
corsOrigin = addLocalDevOrigins(corsOrigin);

// During local development, ensure the frontend dev server is allowed
if (process.env.NODE_ENV !== 'production') {
  const devOrigin = 'http://localhost:5173';
  if (corsOrigin === true || corsOrigin === '*') {
    // already allows all origins
  } else if (typeof corsOrigin === 'string') {
    const list = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
    if (!list.includes(devOrigin)) list.push(devOrigin);
    corsOrigin = list.length === 1 ? list[0] : list;
  } else if (Array.isArray(corsOrigin)) {
    if (!corsOrigin.includes(devOrigin)) corsOrigin.push(devOrigin);
  }
}

// Build a normalized allowed origins list and use a function to echo back
// the request origin when it's allowed. This ensures correct header values.
const buildAllowedList = (originConf) => {
  if (originConf === true || originConf === '*') return ['*'];
  if (!originConf) return [];
  if (Array.isArray(originConf)) return originConf.map((o) => o.trim()).filter(Boolean);
  return originConf.split(',').map((o) => o.trim()).filter(Boolean);
};

const allowedOrigins = buildAllowedList(corsOrigin);

app.use(cors({
  origin: function (requestOrigin, callback) {
    // Allow non-browser requests (like curl) when no origin is present
    if (!requestOrigin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(requestOrigin)) return callback(null, true);
    // Not allowed
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/category-data', categoryDataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/you-may-also-like', youMayAlsoLikeRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/bank-details', bankDetailRoutes);
app.use('/api/customer-orders', customerOrderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/admin-customers', adminCustomerRoutes);
app.use('/api/selected-items', selectedItemsRoutes);
app.use('/api/user-addresses', userAddressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
console.log('reviewRoutes paths:', reviewRoutes.stack.map(s => (s.route ? s.route.path : '<non-route>')));

app.use("/api/notifications", notificationRoutes);
app.get('/', (req, res) => {
  res.send('Click Clothing API is running.');
});

// Debug: print registered routes (useful during local dev)
const listRoutes = () => {
  try {
    const routes = [];
    const stack = app && app._router && Array.isArray(app._router.stack) ? app._router.stack : [];
    stack.forEach((middleware) => {
      try {
        if (middleware && middleware.route) {
          const methods = Object.keys(middleware.route.methods || {}).map(m => m.toUpperCase()).join(',');
          routes.push(`${methods} ${middleware.route.path}`);
        } else if (middleware && middleware.name === 'router' && middleware.handle && Array.isArray(middleware.handle.stack)) {
          middleware.handle.stack.forEach((handler) => {
            if (handler && handler.route) {
              const methods = Object.keys(handler.route.methods || {}).map(m => m.toUpperCase()).join(',');
              routes.push(`${methods} ${handler.route.path}`);
            }
          });
        }
      } catch (innerErr) {
        // ignore malformed middleware entries
      }
    });
    console.log('Registered routes:\n' + routes.join('\n'));
  } catch (err) {
    console.error('Failed to list routes:', err);
  }
};

// Initialize database connection for both serverless and traditional deployment
let dbInitialized = false;
const initializeDatabase = async () => {
  if (dbInitialized) return;
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');
    dbInitialized = true;

    if (process.env.DB_SYNC === 'true') {
      // sync() with no options only CREATES missing tables — never drops or alters existing ones
      await db.sequelize.sync();
      console.log('Database sync completed.');
    }
  } catch (err) {
    console.error('Unable to connect to database:', err);
    throw err;
  }
};

// For Vercel serverless: Initialize on first request
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
    } catch (err) {
      console.error('Database initialization failed:', err);
      return res.status(503).json({ error: 'Service unavailable - database connection failed' });
    }
  }
  next();
});

// Global error handler to ensure JSON responses for unexpected errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ success: false, message: err?.message || 'Internal Server Error' });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      // print routes for debugging
      listRoutes();
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
};

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  startServer();
}

// Export app for Vercel serverless
module.exports = app;
