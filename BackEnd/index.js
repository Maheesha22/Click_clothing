require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

const db = require("./models");

db.sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Tables created successfully!");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

const userRoutes    = require("./routes/UserRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/CartRoutes");
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
//const categoryRoutes = require("./routes/categoryRoutes");   // ✅ Added

app.use("/api/users",    userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
//app.use("/api/categories", categoryRoutes);                  // ✅ Added

const wishlistRoutes = require("./routes/WishlistRoutes");
const bankDetailRoutes = require("./routes/bankDetailRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");
const returnRoutes = require("./routes/returnRoutes");

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bank-details", bankDetailRoutes);
app.use("/api/customer-orders", customerOrderRoutes);
app.use("/api/returns", returnRoutes);

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
});
