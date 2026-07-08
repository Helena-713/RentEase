const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const { paginationQuerySchema, paginatedResponseSchema } = require('./pagination.schema');
const {
  VERIFICATION_STATUSES,
  REVIEW_STATUSES,
  VerificationStatus,
} = require('../constants/verificationStatus');

const verificationUserSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })
  .openapi('VerificationUserSummary');

const landlordVerificationSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(VERIFICATION_STATUSES),
    verificationDocument: z.string().nullable(),
    rejectionReason: z.string().nullable(),
    verifiedBy: z.string().uuid().nullable(),
    verifiedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    user: verificationUserSummarySchema.optional(),
  })
  .openapi('LandlordVerification');

const landlordVerificationResponseSchema = successResponseSchema(
  landlordVerificationSchema
).openapi('LandlordVerificationResponse');

const landlordVerificationListResponseSchema = successResponseSchema(
  z.array(landlordVerificationSchema)
).openapi('LandlordVerificationListResponse');

const landlordVerificationPaginatedResponseSchema = paginatedResponseSchema(
  landlordVerificationSchema
).openapi('LandlordVerificationPaginatedResponse');

const listPendingSchema = z.object({
  query: paginationQuerySchema,
});

const reviewBodySchema = z
  .object({
    status: z.enum(REVIEW_STATUSES),
    rejectionReason: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.status !== VerificationStatus.REJECTED || !!data.rejectionReason?.trim(),
    {
      message: 'Rejection reason is required when rejecting',
      path: ['rejectionReason'],
    }
  )
  .openapi('ReviewLandlordVerificationBody');

const reviewParamsSchema = z.object({
  id: z.string().uuid(),
});

const reviewSchema = z.object({
  params: reviewParamsSchema,
  body: reviewBodySchema,
});

module.exports = {
  landlordVerificationSchema,
  landlordVerificationResponseSchema,
  landlordVerificationListResponseSchema,
  landlordVerificationPaginatedResponseSchema,
  listPendingSchema,
  reviewBodySchema,
  reviewSchema,
};
