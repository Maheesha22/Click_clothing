'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comparison extends Model {
    static associate(models) {
      Comparison.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  Comparison.init({
    userId: DataTypes.INTEGER,
    comparisonName: DataTypes.STRING,
    productIds: DataTypes.JSON, // Array of product IDs
    productDetails: DataTypes.JSON // Cached product details for quick display
  }, {
    sequelize,
    modelName: 'Comparison',
    tableName: 'comparisons',
    timestamps: true
  });

  return Comparison;
};
