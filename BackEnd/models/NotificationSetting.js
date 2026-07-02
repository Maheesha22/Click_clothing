'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationSetting extends Model {
    static associate(models) {
      NotificationSetting.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
    }
  }
  
  NotificationSetting.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    new_order_alerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    low_stock_alerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    payment_failures: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    weekly_reports: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    customer_signups: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'NotificationSetting',
    tableName: 'notification_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return NotificationSetting;
};
