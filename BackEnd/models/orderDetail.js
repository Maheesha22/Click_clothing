'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      OrderDetail.belongsTo(models.Order, { foreignKey: 'orderId' });
    }
  }

  OrderDetail.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    barcode: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'order_details',
    timestamps: true
  });

  return OrderDetail;
};
