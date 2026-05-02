const express = require('express');
const cors = require('cors');  // UNCOMMENT THIS
const app = express();

app.use(cors());  // UNCOMMENT THIS
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const db = require("./models");

db.sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    // ADD THIS LINE TO CREATE TABLES
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Tables created successfully!");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

const userRoutes = require("./routes/UserRoutes");
const cartRoutes = require("./routes/CartRoutes");

app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

app.listen(3000, () => {
  console.log(`Server running on port ${3000}`)
});
