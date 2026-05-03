require('dotenv').config();   // ← loads .env for Cloudinary keys

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
const productRoutes = require("./routes/productRoutes");   // ← added
const cartRoutes = require("./routes/CartRoutes");
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use("/api/users",    userRoutes);
app.use("/api/products", productRoutes);                   // ← added
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
});
