'use strict'; 
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
      Product.hasMany(models.ProductWithSizeColor, { foreignKey: 'productId' });
      Product.hasMany(models.OrderItem, { foreignKey: 'productId' });
      Product.hasMany(models.Wishlist, { foreignKey: 'productId' });
    }
  }
  
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  });
  
  return Product;
};
