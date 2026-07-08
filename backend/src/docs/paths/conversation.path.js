const registry = require('../registry');
const {
  conversationResponseSchema,
  conversationPaginatedResponseSchema,
  messageResponseSchema,
  messagePaginatedResponseSchema,
  createConversationBodySchema,
  sendMessageBodySchema,
} = require('../../schemas/conversation.schema');
const { paginationQuerySchema } = require('../../schemas/pagination.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');
const { successResponseSchema } = require('../../schemas/common.schema');
const { z } = require('../../schemas/zod');
const { idParamsSchema } = require('../params');

const standardErrorResponses = {
  400: {
    description: 'Validation failed',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  401: {
    description: 'Unauthorized',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  403: {
    description: 'Forbidden',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
  404: {
    description: 'Not found',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
};

const markReadResponseSchema = successResponseSchema(
  z.object({
    updatedCount: z.number().int(),
  })
).openapi('MarkConversationReadResponse');

registry.registerPath({
  method: 'post',
  path: '/conversations',
  tags: ['Conversations'],
  summary: 'Get or create a conversation for a property (tenant only)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createConversationBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Existing conversation returned',
      content: {
        'application/json': {
          schema: conversationResponseSchema,
        },
      },
    },
    201: {
      description: 'New conversation created',
      content: {
        'application/json': {
          schema: conversationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/mine',
  tags: ['Conversations'],
  summary: 'List tenant conversations (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Tenant conversations',
      content: {
        'application/json': {
          schema: conversationPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/landlord',
  tags: ['Conversations'],
  summary: 'List landlord conversations (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Landlord conversations',
      content: {
        'application/json': {
          schema: conversationPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/{id}',
  tags: ['Conversations'],
  summary: 'Get conversation by id (participant only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Conversation details',
      content: {
        'application/json': {
          schema: conversationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'post',
  path: '/conversations/{id}/messages',
  tags: ['Conversations'],
  summary: 'Send a message in a conversation (participant only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: sendMessageBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Message sent',
      content: {
        'application/json': {
          schema: messageResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/conversations/{id}/messages',
  tags: ['Conversations'],
  summary: 'List messages in a conversation (paginated, participant only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated messages (newest first)',
      content: {
        'application/json': {
          schema: messagePaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/conversations/{id}/read',
  tags: ['Conversations'],
  summary: 'Mark other party messages as read (participant only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Messages marked as read',
      content: {
        'application/json': {
          schema: markReadResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});
