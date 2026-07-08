const registry = require('../registry');
const {
  propertyResponseSchema,
  propertyPaginatedResponseSchema,
  setPropertyAmenitiesBodySchema,
  reviewBodySchema,
} = require('../../schemas/property.schema');
const { paginationQuerySchema } = require('../../schemas/pagination.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');
const { PROPERTY_TYPES } = require('../../constants/propertyType');
const { PROPERTY_STATUSES } = require('../../constants/propertyStatus');

const propertyMultipartSchema = {
  type: 'object',
  required: [
    'title',
    'description',
    'address',
    'city',
    'state',
    'price',
    'propertyType',
    'bedrooms',
    'bathrooms',
    'areaSqft',
    'propertyImages',
  ],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    price: { type: 'number' },
    propertyType: { type: 'string', enum: PROPERTY_TYPES },
    bedrooms: { type: 'integer' },
    bathrooms: { type: 'integer' },
    areaSqft: { type: 'integer' },
    propertyImages: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
    },
  },
};

const updatePropertyMultipartSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    address: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    price: { type: 'number' },
    propertyType: { type: 'string', enum: PROPERTY_TYPES },
    bedrooms: { type: 'integer' },
    bathrooms: { type: 'integer' },
    areaSqft: { type: 'integer' },
    status: { type: 'string', enum: PROPERTY_STATUSES },
    propertyImages: {
      type: 'array',
      items: { type: 'string', format: 'binary' },
    },
  },
};

registry.registerPath({
  method: 'get',
  path: '/properties',
  tags: ['Properties'],
  summary: 'List approved properties (public, paginated)',
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Approved properties',
      content: {
        'application/json': {
          schema: propertyPaginatedResponseSchema,
        },
      },
    },
    400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/properties/public/{id}',
  tags: ['Properties'],
  summary: 'Get approved property by id (public)',
  responses: {
    200: {
      description: 'Property details',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/properties',
  tags: ['Properties'],
  summary: 'Create a property with images (verified landlord only)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: propertyMultipartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Property created',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/properties/mine',
  tags: ['Properties'],
  summary: 'List own properties (paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Own properties',
      content: {
        'application/json': {
          schema: propertyPaginatedResponseSchema,
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/properties/{id}',
  tags: ['Properties'],
  summary: 'Get own property by id',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Property details',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/properties/{id}',
  tags: ['Properties'],
  summary: 'Update property and optionally append images',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: updatePropertyMultipartSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Property updated',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/properties/{id}/images/{imageId}',
  tags: ['Properties'],
  summary: 'Delete a property image',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Image deleted',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    400: { description: 'Cannot delete last image', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/properties/{id}/amenities',
  tags: ['Properties'],
  summary: 'Replace property amenities (owner landlord or admin)',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: setPropertyAmenitiesBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Property amenities updated',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/properties/pending',
  tags: ['Properties'],
  summary: 'List pending properties (admin only, paginated)',
  security: [{ bearerAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Pending properties',
      content: {
        'application/json': {
          schema: propertyPaginatedResponseSchema,
        },
      },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/properties/{id}/review',
  tags: ['Properties'],
  summary: 'Approve or reject a property (admin only)',
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
      description: 'Property reviewed',
      content: {
        'application/json': {
          schema: propertyResponseSchema,
        },
      },
    },
    400: { description: 'Validation failed', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});
