'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: 'categoryId' });
      Category.hasMany(models.ProductWithSizeColor, { foreignKey: 'categoryId' });
      Category.hasMany(models.Return, { foreignKey: 'categoryId' });
    }
  }
  
  Category.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true
  });
  
  return Category;
};
