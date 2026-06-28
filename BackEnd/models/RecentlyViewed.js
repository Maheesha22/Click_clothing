'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RecentlyViewed extends Model {
    static associate(models) {
      RecentlyViewed.belongsTo(models.User, { foreignKey: 'userId' });
      RecentlyViewed.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  RecentlyViewed.init({
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'RecentlyViewed',
    tableName: 'recentlyvieweds',
    timestamps: true
  });

  return RecentlyViewed;
};
