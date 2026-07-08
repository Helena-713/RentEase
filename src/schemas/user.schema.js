const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const { paginationQuerySchema, paginatedResponseSchema } = require('./pagination.schema');
const { authUserSchema } = require('./auth.schema');
const { phoneSchema, strongPasswordSchema } = require('./validators');
const { VERIFICATION_STATUSES } = require('../constants/verificationStatus');

const landlordVerificationSummarySchema = z
  .object({
    status: z.enum(VERIFICATION_STATUSES),
    rejectionReason: z.string().nullable(),
  })
  .openapi('LandlordVerificationSummary');

const meUserSchema = authUserSchema
  .extend({
    landlordVerification: landlordVerificationSummarySchema.optional(),
  })
  .openapi('MeUser');

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

const userResponseSchema = successResponseSchema(meUserSchema).openapi(
  'UserResponse'
);

const userPaginatedResponseSchema = paginatedResponseSchema(
  authUserSchema
).openapi('UserPaginatedResponse');

const listUsersSchema = z.object({
  query: paginationQuerySchema,
});

const listUserReviewsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: paginationQuerySchema,
});

module.exports = {
  updateMeBodySchema,
  updateUserByIdBodySchema,
  updateMeSchema,
  updateUserByIdSchema,
  meUserSchema,
  landlordVerificationSummarySchema,
  userResponseSchema,
  userPaginatedResponseSchema,
  listUsersSchema,
  listUserReviewsSchema,
};
