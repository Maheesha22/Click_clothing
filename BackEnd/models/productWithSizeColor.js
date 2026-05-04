'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductWithSizeColor extends Model {
    static associate(models) {
      ProductWithSizeColor.belongsTo(models.Product, { foreignKey: 'productId' });
      ProductWithSizeColor.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
  }
  
  ProductWithSizeColor.init({
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
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
      defaultValue: 0
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ProductWithSizeColor',
    tableName: 'product_with_size_colors',
    timestamps: true,
    uniqueKeys: {
      unique_product_size_color: {
        fields: ['productId', 'size', 'color']
      }
    }
  });
  
  return ProductWithSizeColor;
};
