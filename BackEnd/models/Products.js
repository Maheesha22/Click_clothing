'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    product_name: DataTypes.STRING,
    product_description: DataTypes.TEXT,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    image_url: DataTypes.TEXT,
    quantity: DataTypes.INTEGER,
    category: DataTypes.STRING,
    available: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
