const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const { authUserSchema } = require('./auth.schema');
const { phoneSchema, strongPasswordSchema } = require('./validators');

const updateFieldsSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: phoneSchema.optional(),
  password: strongPasswordSchema.optional(),
});

const updateMeBodySchema = updateFieldsSchema
  .extend({
    currentPassword: z.string().min(1).optional(),
  })
  .refine((data) => !data.password || data.currentPassword, {
    message: 'Current password is required when changing password',
    path: ['currentPassword'],
  })
  .openapi('UpdateMeBody');

const updateUserByIdBodySchema =
  updateFieldsSchema.openapi('UpdateUserByIdBody');

const updateMeSchema = z.object({
  body: updateMeBodySchema,
});

const updateUserByIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateUserByIdSchema = z.object({
  params: updateUserByIdParamsSchema,
  body: updateUserByIdBodySchema,
});

const userResponseSchema = successResponseSchema(authUserSchema).openapi(
  'UserResponse'
);

module.exports = {
  updateMeBodySchema,
  updateUserByIdBodySchema,
  updateMeSchema,
  updateUserByIdSchema,
  userResponseSchema,
};
