'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, { foreignKey: 'customerId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
      Order.hasOne(models.OrderDetail, { foreignKey: 'orderId' });
    }
  }
  
  Order.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_number'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      field: 'customerId'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      field: 'productId'
    },
    size: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deliveryCharges: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'delivery_charges'
    },
    totalBill: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_bill'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'payment_method'
    },
    paymentSlip: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'payment_slip'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
  });
  
  return Order;
};
