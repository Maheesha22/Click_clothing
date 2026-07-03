'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SizeRecommendation extends Model {
    static associate(models) {
      SizeRecommendation.belongsTo(models.User, { foreignKey: 'userId' });
      SizeRecommendation.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  SizeRecommendation.init({
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    recommendedSize: DataTypes.STRING,
    bodyType: DataTypes.STRING,
    confidence: DataTypes.DECIMAL(5, 2),
    chestEstimate: DataTypes.DECIMAL(5, 2),
    productName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'SizeRecommendation',
    tableName: 'size_recommendations',
    timestamps: true,
  });

  return SizeRecommendation;
};
