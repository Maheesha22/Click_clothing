'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotKeyword extends Model {
    static associate(models) {
      ChatbotKeyword.belongsTo(models.ChatbotIntent, {
        foreignKey: 'intentId',
        as: 'intent'
      });
    }
  }

  ChatbotKeyword.init({
    intentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ChatbotKeyword',
    tableName: 'chatbot_keywords',
    timestamps: true,
    indexes: [
      {
        fields: ['intentId']
      }
    ]
  });

  return ChatbotKeyword;
};
