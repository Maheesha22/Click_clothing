'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'items'
      });

      Order.hasOne(models.OrderDetail, {
        foreignKey: 'orderId',
        as: 'detail'
      });

      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });

      Order.hasMany(models.Review, {
        foreignKey: 'orderId',
        as: 'reviews'
      });
    }
  }

  Order.init({
    order_number: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,

    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    payment_method: DataTypes.STRING,
    payment_slip: DataTypes.STRING,
    delivery_charges: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    total_bill: DataTypes.DECIMAL(10,2),
    payment_status: {
      type: DataTypes.STRING,
      defaultValue: 'PENDING'
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
  });

  return Order;
};
