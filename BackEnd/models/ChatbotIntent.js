'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotIntent extends Model {
    static associate(models) {
      ChatbotIntent.hasMany(models.ChatbotKeyword, { foreignKey: 'intentId', as: 'keywords' });
      ChatbotIntent.hasMany(models.ChatbotResponse, { foreignKey: 'intentId', as: 'responses' });
    }
  }

  ChatbotIntent.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ChatbotIntent',
    tableName: 'chatbot_intents',
    timestamps: true
  });

  return ChatbotIntent;
};
