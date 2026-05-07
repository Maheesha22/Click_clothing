const { sequelize } = require('./BackEnd/models');

async function test() {
  try {
    const [results] = await sequelize.query("SELECT userId, address, city, district, province FROM Orders LIMIT 5");
    console.log("ORDERS ADDRESSES:", results);
    const [results2] = await sequelize.query("SELECT userId, address, city, district, province FROM customers LIMIT 5");
    console.log("CUSTOMERS ADDRESSES:", results2);
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

test();
