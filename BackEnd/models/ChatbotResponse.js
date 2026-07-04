'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotResponse extends Model {
    static associate(models) {
      ChatbotResponse.belongsTo(models.ChatbotIntent, {
        foreignKey: 'intentId',
        as: 'intent'
      });
    }
  }

  ChatbotResponse.init({
    intentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    responseText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    responseType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'text'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ChatbotResponse',
    tableName: 'chatbot_responses',
    timestamps: true,
    indexes: [
      {
        fields: ['intentId']
      }
    ]
  });

  return ChatbotResponse;
};
