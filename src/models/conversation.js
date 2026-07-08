const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    landlordId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'conversations',
    underscored: true,
  }
);

Conversation.associate = (models) => {
  Conversation.belongsTo(models.Property, {
    as: 'property',
    foreignKey: 'propertyId',
  });
  Conversation.belongsTo(models.User, {
    as: 'tenant',
    foreignKey: 'tenantId',
  });
  Conversation.belongsTo(models.User, {
    as: 'landlord',
    foreignKey: 'landlordId',
  });
  Conversation.hasMany(models.Message, {
    as: 'messages',
    foreignKey: 'conversationId',
  });
};

module.exports = Conversation;
