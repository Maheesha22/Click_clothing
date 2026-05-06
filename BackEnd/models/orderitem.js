'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId'
      });

      OrderItem.belongsTo(models.Product, {
        foreignKey: 'productId'
      });

      OrderItem.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }

  OrderItem.init({
    orderId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10,2)
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true
  });

  return OrderItem;
};
