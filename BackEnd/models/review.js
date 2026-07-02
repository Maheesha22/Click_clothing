'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });

      Review.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });

      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrls: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      {
        // prevent duplicate reviews for same user+order+product
        unique: true,
        fields: ['userId', 'orderId', 'productId']
      }
    ]
  });

  return Review;
};
