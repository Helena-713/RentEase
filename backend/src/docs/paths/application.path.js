const registry = require('../registry');
const {
  applicationResponseSchema,
  applicationPaginatedResponseSchema,
  createApplicationBodySchema,
  listApplicationsQuerySchema,
} = require('../../schemas/application.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');
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
  409: {
    description: 'Conflict',
    content: { 'application/json': { schema: errorResponseSchema } },
  },
};

registry.registerPath({
  method: 'post',
  path: '/applications',
  tags: ['Applications'],
  summary: 'Apply for a property (tenant only)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createApplicationBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Application created',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/mine',
  tags: ['Applications'],
  summary: 'List current tenant applications (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: listApplicationsQuerySchema,
  },
  responses: {
    200: {
      description: 'Tenant applications',
      content: {
        'application/json': {
          schema: applicationPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/mine/{id}',
  tags: ['Applications'],
  summary: 'Get tenant application by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application details',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/landlord',
  tags: ['Applications'],
  summary: 'List applications for landlord properties (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: listApplicationsQuerySchema,
  },
  responses: {
    200: {
      description: 'Landlord applications',
      content: {
        'application/json': {
          schema: applicationPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/landlord/{id}',
  tags: ['Applications'],
  summary: 'Get landlord application by id',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application details',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/applications/{id}/approve',
  tags: ['Applications'],
  summary: 'Approve an application (landlord only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application approved; property reserved',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/applications/{id}/reject',
  tags: ['Applications'],
  summary: 'Reject an application (landlord only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application rejected',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/applications/{id}/rent',
  tags: ['Applications'],
  summary: 'Mark property as rented for approved application (landlord only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Property marked as rented',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/applications/{id}/withdraw',
  tags: ['Applications'],
  summary: 'Withdraw a pending application (tenant only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application withdrawn',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications',
  tags: ['Applications'],
  summary: 'List all applications (admin only, paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: listApplicationsQuerySchema,
  },
  responses: {
    200: {
      description: 'All applications',
      content: {
        'application/json': {
          schema: applicationPaginatedResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/applications/{id}',
  tags: ['Applications'],
  summary: 'Get application by id (admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application details',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/applications/{id}/cancel',
  tags: ['Applications'],
  summary: 'Cancel an application (admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: 'Application cancelled',
      content: {
        'application/json': {
          schema: applicationResponseSchema,
        },
      },
    },
    ...standardErrorResponses,
  },
});
