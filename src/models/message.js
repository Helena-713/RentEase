const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'messages',
    underscored: true,
    updatedAt: false,
  }
);

Message.associate = (models) => {
  Message.belongsTo(models.Conversation, {
    as: 'conversation',
    foreignKey: 'conversationId',
  });
  Message.belongsTo(models.User, {
    as: 'sender',
    foreignKey: 'senderId',
  });
};

module.exports = Message;
