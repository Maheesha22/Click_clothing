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
const notificationRoutes = require("./routes/notificationRoutes");

const db = require('./models');
const sizeRecommendationRoutes = require('./routes/sizeRecommendationRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const parseCorsOrigin = (originEnv) => {
  if (!originEnv) return '*'; // fallback to allow all if not configured
  if (originEnv === '*') return true;
  const origins = originEnv.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

const port = Number(process.env.PORT) || 3000;
let corsOrigin = parseCorsOrigin(process.env.CORS_ORIGIN || process.env.FRONTEND_URL);

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

// Log all requests
app.use((req, res, next) => {
  console.log(`📍 [REQUEST] ${req.method} ${req.path}`);
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
app.use('/api/size-recommendations', sizeRecommendationRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use("/api/notifications", notificationRoutes);
app.get('/', (req, res) => {
  res.send('Click Clothing API is running.');
});

// Initialize database connection for both serverless and traditional deployment
let dbInitialized = false;
const initializeDatabase = async () => {
  if (dbInitialized) return;
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    dbInitialized = true;

    const shouldSync = process.env.DB_SYNC === 'true' ||
      (process.env.NODE_ENV !== 'production' && process.env.DB_SYNC !== 'false');

    if (shouldSync) {
      await db.sequelize.sync();
      console.log('✅ Database sync completed.');
    }
  } catch (err) {
    console.error('❌ Unable to connect to database:', err);
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

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
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