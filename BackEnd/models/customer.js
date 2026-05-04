'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.User, { foreignKey: 'userId' });
      Customer.hasMany(models.Order, { foreignKey: 'customerId' });
    }
  }

  Customer.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name' // maps DB column if needed
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    province: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    }

  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true
  });

  return Customer;
};
