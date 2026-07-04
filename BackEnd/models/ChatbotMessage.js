'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotMessage extends Model {
    static associate(models) {
      ChatbotMessage.belongsTo(models.ChatbotSession, {
        foreignKey: 'sessionId',
        as: 'session'
      });
      ChatbotMessage.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  ChatbotMessage.init({
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    sender: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'user'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ChatbotMessage',
    tableName: 'chatbot_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['sessionId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return ChatbotMessage;
};
