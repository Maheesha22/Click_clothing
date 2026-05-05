'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankDetail extends Model {
    static associate(models) {
      // No specific associations needed for now
    }
  }

  BankDetail.init({
    bankName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'BankDetail',
    tableName: 'bank_details',
    timestamps: true
  });

  return BankDetail;
};
