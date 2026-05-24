require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path  = require('path');
const app     = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

const db = require("./models");

db.sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return db.sequelize.sync();
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
const categoryRoutes = require("./routes/categoryRoutes");   
const categoryDataRoutes = require("./routes/categoryDataRoutes"); 
const searchRoutes = require("./routes/searchRoutes");   
const searchHistoryRoutes = require("./routes/searchHistoryRoutes"); 
const youMayAlsoLikeRoutes = require("./routes/youMayAlsoLikeRoutes");



app.use("/api/users",    userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);                  
app.use("/api/category-data", categoryDataRoutes);           

app.use("/api/search", searchRoutes);                        
app.use("/api/search-history", searchHistoryRoutes); 
app.use("/api/you-may-also-like", youMayAlsoLikeRoutes); 

const wishlistRoutes = require("./routes/WishlistRoutes");
const bankDetailRoutes = require("./routes/bankDetailRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");
const returnRoutes = require("./routes/returnRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const selectedItemsRoutes = require("./routes/SelectedItemsRoutes");
const userAddressRoutes = require("./routes/userAddressRoutes");


app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bank-details", bankDetailRoutes);
app.use("/api/customer-orders", customerOrderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/admin-customers", adminCustomerRoutes);
app.use("/api/selected-items", selectedItemsRoutes);
app.use("/api/user-addresses", userAddressRoutes);

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
});
