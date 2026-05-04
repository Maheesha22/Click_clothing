'use strict'; 
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Return extends Model {
    static associate(models) {
      Return.belongsTo(models.Product, { foreignKey: 'productId' });
      Return.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
  }
  
  Return.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
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
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Return',
    tableName: 'returns',
    timestamps: true
  });
  
  return Return;
};
