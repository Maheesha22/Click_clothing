'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Return extends Model {
    static associate(models) {
      Return.belongsTo(models.User, { foreignKey: 'userId' });
      Return.belongsTo(models.Order, { foreignKey: 'orderId' });
      Return.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  Return.init({
    userId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    reason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Return',
    tableName: 'returns',
    timestamps: true
  });

  return Return;
};
