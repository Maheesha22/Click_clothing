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
const db = require('./models');

const parseCorsOrigin = (originEnv) => {
  if (!originEnv) return '*'; // fallback to allow all if not configured
  if (originEnv === '*') return true;
  const origins = originEnv.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

const port = Number(process.env.PORT) || 3000;
const corsOrigin = parseCorsOrigin(process.env.CORS_ORIGIN || process.env.FRONTEND_URL);

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // handle preflight for all routes
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

app.get('/', (req, res) => {
  res.send('Click Clothing API is running.');
});

// Initialize database connection for both serverless and traditional deployment
const initializeDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');

    if (process.env.DB_SYNC === 'true' && process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync();
      console.log('Database sync completed.');
    }
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
};

// Initialize database immediately
initializeDatabase();

const startServer = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
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
