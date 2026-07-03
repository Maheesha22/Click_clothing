'use strict'; 
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Return extends Model {
    static associate(models) {
      Return.belongsTo(models.User, { foreignKey: 'userId' });
      Return.belongsTo(models.Order, { foreignKey: 'orderId' });
    }
  }

  Return.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    products: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of products: [{productId, quantity, size, color}, ...]'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Return reason for all products'
    },
    /*status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: 'pending, approved, rejected, completed'
    }*/
  }, {
    sequelize,
    modelName: 'Return',
    tableName: 'returns',
    timestamps: true
  });

  return Return;
};
