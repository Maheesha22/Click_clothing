'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatbotUnknownQuestion extends Model {
    static associate(models) {
      ChatbotUnknownQuestion.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  ChatbotUnknownQuestion.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    handled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ChatbotUnknownQuestion',
    tableName: 'chatbot_unknown_questions',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['handled']
      }
    ]
  });

  return ChatbotUnknownQuestion;
};
