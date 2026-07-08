const { Op } = require('sequelize');
const {
  Conversation,
  Message,
  Property,
  User,
  sequelize,
} = require('../models');
const AppError = require('../utils/AppError');
const { getPaginationOptions } = require('../utils/pagination');

const userSummaryAttributes = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
];

const senderSummaryAttributes = ['id', 'firstName', 'lastName'];

const propertySummaryAttributes = ['id', 'title', 'address', 'city', 'state'];

const propertyInclude = {
  model: Property,
  as: 'property',
  attributes: propertySummaryAttributes,
};

const tenantInclude = {
  model: User,
  as: 'tenant',
  attributes: userSummaryAttributes,
};

const landlordInclude = {
  model: User,
  as: 'landlord',
  attributes: userSummaryAttributes,
};

const senderInclude = {
  model: User,
  as: 'sender',
  attributes: senderSummaryAttributes,
};

const lastMessageInclude = {
  model: Message,
  as: 'messages',
  separate: true,
  limit: 1,
  order: [['createdAt', 'DESC']],
  include: [senderInclude],
};

const conversationIncludes = [
  propertyInclude,
  tenantInclude,
  landlordInclude,
  lastMessageInclude,
];

const sanitizeUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
});

const sanitizeSenderSummary = (sender) => ({
  id: sender.id,
  firstName: sender.firstName,
  lastName: sender.lastName,
});

const sanitizePropertySummary = (property) => ({
  id: property.id,
  title: property.title,
  address: property.address,
  city: property.city,
  state: property.state,
});

const sanitizeMessage = (message, { includeSender = false } = {}) => {
  const result = {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    message: message.message,
    isRead: message.isRead,
    createdAt: message.createdAt,
  };

  if (includeSender && message.sender) {
    result.sender = sanitizeSenderSummary(message.sender);
  }

  return result;
};

const sanitizeConversation = (
  conversation,
  {
    includeProperty = false,
    includeTenant = false,
    includeLandlord = false,
    includeLastMessage = false,
  } = {}
) => {
  const result = {
    id: conversation.id,
    propertyId: conversation.propertyId,
    tenantId: conversation.tenantId,
    landlordId: conversation.landlordId,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };

  if (includeProperty && conversation.property) {
    result.property = sanitizePropertySummary(conversation.property);
  }

  if (includeTenant && conversation.tenant) {
    result.tenant = sanitizeUserSummary(conversation.tenant);
  }

  if (includeLandlord && conversation.landlord) {
    result.landlord = sanitizeUserSummary(conversation.landlord);
  }

  if (includeLastMessage && conversation.messages?.length) {
    result.lastMessage = sanitizeMessage(conversation.messages[0], {
      includeSender: true,
    });
  }

  return result;
};

const assertParticipant = (conversation, userId) => {
  if (conversation.tenantId !== userId && conversation.landlordId !== userId) {
    throw new AppError('Forbidden', 403);
  }
};

const findConversationById = async (conversationId, options = {}) => {
  const conversation = await Conversation.findByPk(conversationId, {
    include: conversationIncludes,
    ...options,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  return conversation;
};

const ensurePropertyEligibleForMessaging = (property) => {
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (!property.isApproved) {
    throw new AppError('Property is not available for messaging', 400);
  }
};

const findOrCreate = async ({ tenantId, propertyId }) => {
  const property = await Property.findByPk(propertyId);
  ensurePropertyEligibleForMessaging(property);

  const landlordId = property.landlordId;

  const existing = await Conversation.findOne({
    where: { propertyId, tenantId, landlordId },
    include: conversationIncludes,
  });

  if (existing) {
    return {
      conversation: sanitizeConversation(existing, {
        includeProperty: true,
        includeTenant: true,
        includeLandlord: true,
        includeLastMessage: true,
      }),
      created: false,
    };
  }

  const conversation = await Conversation.create({
    propertyId,
    tenantId,
    landlordId,
  });

  const created = await findConversationById(conversation.id);

  return {
    conversation: sanitizeConversation(created, {
      includeProperty: true,
      includeTenant: true,
      includeLandlord: true,
      includeLastMessage: true,
    }),
    created: true,
  };
};

const getById = async (conversationId, userId) => {
  const conversation = await findConversationById(conversationId);
  assertParticipant(conversation, userId);

  return sanitizeConversation(conversation, {
    includeProperty: true,
    includeTenant: true,
    includeLandlord: true,
    includeLastMessage: true,
  });
};

const listForTenant = async (tenantId, { page, limit }) => {
  const { rows, count } = await Conversation.findAndCountAll({
    where: { tenantId },
    include: conversationIncludes,
    distinct: true,
    order: [
      [sequelize.literal('last_message_at DESC NULLS LAST')],
      ['createdAt', 'DESC'],
    ],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((conversation) =>
      sanitizeConversation(conversation, {
        includeProperty: true,
        includeLandlord: true,
        includeLastMessage: true,
      })
    ),
    total: count,
  };
};

const listForLandlord = async (landlordId, { page, limit }) => {
  const { rows, count } = await Conversation.findAndCountAll({
    where: { landlordId },
    include: conversationIncludes,
    distinct: true,
    order: [
      [sequelize.literal('last_message_at DESC NULLS LAST')],
      ['createdAt', 'DESC'],
    ],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((conversation) =>
      sanitizeConversation(conversation, {
        includeProperty: true,
        includeTenant: true,
        includeLastMessage: true,
      })
    ),
    total: count,
  };
};

const sendMessage = async (conversationId, senderId, messageText) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  assertParticipant(conversation, senderId);

  const transaction = await sequelize.transaction();

  try {
    const message = await Message.create(
      {
        conversationId,
        senderId,
        message: messageText.trim(),
        isRead: false,
      },
      { transaction }
    );

    await conversation.update(
      { lastMessageAt: message.createdAt },
      { transaction }
    );

    await transaction.commit();

    const created = await Message.findByPk(message.id, {
      include: [senderInclude],
    });

    return sanitizeMessage(created, { includeSender: true });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const listMessages = async (conversationId, userId, { page, limit }) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  assertParticipant(conversation, userId);

  const { rows, count } = await Message.findAndCountAll({
    where: { conversationId },
    include: [senderInclude],
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((message) =>
      sanitizeMessage(message, { includeSender: true })
    ),
    total: count,
  };
};

const markAsRead = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  assertParticipant(conversation, userId);

  const [updatedCount] = await Message.update(
    { isRead: true },
    {
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    }
  );

  return { updatedCount };
};

module.exports = {
  findOrCreate,
  getById,
  listForTenant,
  listForLandlord,
  sendMessage,
  listMessages,
  markAsRead,
};
