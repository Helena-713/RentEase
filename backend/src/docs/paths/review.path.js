const registry = require('../registry');
const {
  reviewResponseSchema,
  reviewPaginatedResponseSchema,
  createReviewBodySchema,
} = require('../../schemas/review.schema');
const { paginationQuerySchema } = require('../../schemas/pagination.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');

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
  409: {
    description: 'Conflict',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
};

registry.registerPath({
  method: 'post',
  path: '/reviews',
  tags: ['Reviews'],
  summary: 'Create a review after rental completion (tenant or landlord)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createReviewBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Review created',
      content: {
        'application/json': {
          schema: reviewResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/reviews/mine',
  tags: ['Reviews'],
  summary: 'List reviews I wrote (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Reviews written by current user',
      content: {
        'application/json': {
          schema: reviewPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/reviews/received',
  tags: ['Reviews'],
  summary: 'List reviews about me (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Reviews received by current user',
      content: {
        'application/json': {
          schema: reviewPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/reviews',
  tags: ['Reviews'],
  summary: 'List all reviews (admin only, paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'All reviews',
      content: {
        'application/json': {
          schema: reviewPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/reviews/{id}',
  tags: ['Reviews'],
  summary: 'Get review by id (admin only)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Review details',
      content: {
        'application/json': {
          schema: reviewResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});
