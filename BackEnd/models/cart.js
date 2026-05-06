'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId' });
      Cart.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  Cart.init({
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true
  });

  return Cart;
};
