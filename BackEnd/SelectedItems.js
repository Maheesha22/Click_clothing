'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SelectedItems extends Model {
    static associate(models) {
      SelectedItems.belongsTo(models.User, { foreignKey: 'userId' });
      SelectedItems.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  SelectedItems.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'SelectedItems',
    tableName: 'selected_items',
    timestamps: true
  });

  return SelectedItems;
};
