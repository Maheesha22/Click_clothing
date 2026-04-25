const express = require('express');
const app = express();
//const cors = require('cors');

app.use(express.json());

//app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`)
})

const db = require("./models");

db.sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

const userRoutes = require("./routes/UserRoutes");

app.use("/api/users", userRoutes);