'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      // Each variant belongs to one product
      ProductVariant.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  ProductVariant.init({
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
      allowNull: false,
      defaultValue: 0
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProductVariant',
    tableName: 'product_variants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productId', 'size', 'color']
      }
    ]
  });

  return ProductVariant;
};
