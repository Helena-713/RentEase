const registry = require('../registry');
const {
  amenityResponseSchema,
  amenityPaginatedResponseSchema,
  createAmenityBodySchema,
} = require('../../schemas/amenity.schema');
const { paginationQuerySchema } = require('../../schemas/pagination.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');

registry.registerPath({
  method: 'post',
  path: '/amenities',
  tags: ['Amenities'],
  summary: 'Create an amenity (admin only)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createAmenityBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Amenity created',
      content: {
        'application/json': {
          schema: amenityResponseSchema,
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
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description: 'Amenity already exists',
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
  path: '/amenities',
  tags: ['Amenities'],
  summary: 'List amenities (paginated)',
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated amenity list',
      content: {
        'application/json': {
          schema: amenityPaginatedResponseSchema,
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
  },
});

registry.registerPath({
  method: 'get',
  path: '/amenities/{id}',
  tags: ['Amenities'],
  summary: 'Get amenity by id',
  responses: {
    200: {
      description: 'Amenity details',
      content: {
        'application/json': {
          schema: amenityResponseSchema,
        },
      },
    },
    404: {
      description: 'Amenity not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
