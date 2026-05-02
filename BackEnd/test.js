const db = require("./models");
const ctrl = require("./controllers/productController");

console.log("DB keys:", Object.keys(db));
console.log("Product in DB:", typeof db.Product, typeof db.Product.findAndCountAll);

// Try calling the controller method manually
const req = { query: {} };
const res = { 
  status: (code) => ({ json: (data) => console.log("RES:", code, data) }) 
};

ctrl.getAllProducts(req, res).then(() => console.log("Done")).catch(console.error);
