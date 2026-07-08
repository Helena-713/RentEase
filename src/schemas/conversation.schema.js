const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const {
  paginationQuerySchema,
  paginatedResponseSchema,
} = require('./pagination.schema');

const conversationUserSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })
  .openapi('ConversationUserSummary');

const conversationPropertySummarySchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
  })
  .openapi('ConversationPropertySummary');

const messageSenderSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  })
  .openapi('MessageSenderSummary');

const messageSchema = z
  .object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    senderId: z.string().uuid(),
    message: z.string(),
    isRead: z.boolean(),
    createdAt: z.string().datetime(),
    sender: messageSenderSummarySchema.optional(),
  })
  .openapi('Message');

const conversationSchema = z
  .object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    landlordId: z.string().uuid(),
    lastMessageAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    property: conversationPropertySummarySchema.optional(),
    tenant: conversationUserSummarySchema.optional(),
    landlord: conversationUserSummarySchema.optional(),
    lastMessage: messageSchema.optional(),
  })
  .openapi('Conversation');

const conversationResponseSchema = successResponseSchema(
  conversationSchema
).openapi('ConversationResponse');

const conversationPaginatedResponseSchema = paginatedResponseSchema(
  conversationSchema
).openapi('ConversationPaginatedResponse');

const messageResponseSchema = successResponseSchema(messageSchema).openapi(
  'MessageResponse'
);

const messagePaginatedResponseSchema = paginatedResponseSchema(
  messageSchema
).openapi('MessagePaginatedResponse');

const createConversationBodySchema = z
  .object({
    propertyId: z.string().uuid(),
  })
  .openapi('CreateConversationBody');

const createConversationSchema = z.object({
  body: createConversationBodySchema,
});

const listConversationsSchema = z.object({
  query: paginationQuerySchema,
});

const conversationIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const getConversationSchema = z.object({
  params: conversationIdParamsSchema,
});

const sendMessageBodySchema = z
  .object({
    message: z.string().trim().min(1),
  })
  .openapi('SendMessageBody');

const sendMessageSchema = z.object({
  params: conversationIdParamsSchema,
  body: sendMessageBodySchema,
});

const listMessagesSchema = z.object({
  params: conversationIdParamsSchema,
  query: paginationQuerySchema,
});

const markConversationReadSchema = z.object({
  params: conversationIdParamsSchema,
});

module.exports = {
  conversationSchema,
  conversationResponseSchema,
  conversationPaginatedResponseSchema,
  messageSchema,
  messageResponseSchema,
  messagePaginatedResponseSchema,
  createConversationBodySchema,
  createConversationSchema,
  listConversationsSchema,
  getConversationSchema,
  sendMessageBodySchema,
  sendMessageSchema,
  listMessagesSchema,
  markConversationReadSchema,
};
