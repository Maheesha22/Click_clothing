'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Wishlist.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'product_id'
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'product_name'
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'wishlists',
    timestamps: true
  });

  return Wishlist;
};
