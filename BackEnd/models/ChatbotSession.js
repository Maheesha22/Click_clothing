'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotSession extends Model {
    static associate(models) {
      ChatbotSession.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      ChatbotSession.hasMany(models.ChatbotMessage, {
        foreignKey: 'sessionId',
        as: 'messages'
      });
    }
  }

  ChatbotSession.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sessionName: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ChatbotSession',
    tableName: 'chatbot_sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      }
    ]
  });

  return ChatbotSession;
};
