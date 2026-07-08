const registry = require('../registry');
const {
  loginBodySchema,
  authResponseSchema,
} = require('../../schemas/auth.schema');
const { errorResponseSchema } = require('../../schemas/common.schema');

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new landlord or tenant',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: [
              'firstName',
              'lastName',
              'email',
              'password',
              'phone',
              'role',
            ],
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
              phone: { type: 'string' },
              role: { type: 'string', enum: ['LAND_LORD', 'TENANT'] },
              profileImage: { type: 'string', format: 'binary' },
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: authResponseSchema,
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
    409: {
      description: 'Email already exists',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: authResponseSchema,
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
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    403: {
      description: 'Account inactive',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
