const registry = require('../registry');
const {
  landlordVerificationResponseSchema,
  landlordVerificationListResponseSchema,
  reviewBodySchema,
} = require('../../schemas/landlordVerification.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');

registry.registerPath({
  method: 'patch',
  path: '/users/me/landlord-verification',
  tags: ['Landlord Verifications'],
  summary: 'Upload or replace own verification document',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['verificationDocument'],
            properties: {
              verificationDocument: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Verification document updated',
      content: {
        'application/json': {
          schema: landlordVerificationResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation failed',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden or verification not editable',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: 'Verification not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/landlord-verifications/pending',
  tags: ['Landlord Verifications'],
  summary: 'List pending landlord verifications (admin only)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Pending verifications',
      content: {
        'application/json': {
          schema: landlordVerificationListResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/landlord-verifications/{id}/review',
  tags: ['Landlord Verifications'],
  summary: 'Review a pending landlord verification (admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: reviewBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Verification reviewed',
      content: {
        'application/json': {
          schema: landlordVerificationResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation failed or verification not pending',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    404: {
      description: 'Verification not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
