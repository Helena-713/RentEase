const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const { REGISTER_ROLES, USER_ROLES } = require('../constants/userRoles');
const { phoneSchema, strongPasswordSchema } = require('./validators');

const registerBodySchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: strongPasswordSchema,
    phone: phoneSchema,
    role: z.enum(REGISTER_ROLES),
  })
  .openapi('RegisterBody');

const loginBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .openapi('LoginBody');

const registerSchema = z.object({
  body: registerBodySchema,
});

const loginSchema = z.object({
  body: loginBodySchema,
});

const authUserSchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    role: z.enum(USER_ROLES),
    profileImage: z.string().nullable(),
    isActive: z.boolean(),
  })
  .openapi('AuthUser');

const authDataSchema = z
  .object({
    token: z.string(),
    expiresAt: z.string().datetime(),
    user: authUserSchema,
  })
  .openapi('AuthData');

const authResponseSchema = successResponseSchema(authDataSchema).openapi(
  'AuthResponse'
);

module.exports = {
  registerBodySchema,
  loginBodySchema,
  registerSchema,
  loginSchema,
  authUserSchema,
  authDataSchema,
  authResponseSchema,
};
