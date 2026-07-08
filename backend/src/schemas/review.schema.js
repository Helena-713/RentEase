const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const {
  paginationQuerySchema,
  paginatedResponseSchema,
} = require('./pagination.schema');
const { REVIEW_TARGET_TYPES } = require('../constants/reviewTargetType');

const reviewUserSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })
  .openapi('ReviewUserSummary');

const reviewPropertySummarySchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
  })
  .openapi('ReviewPropertySummary');

const reviewSchema = z
  .object({
    id: z.string().uuid(),
    reviewerId: z.string().uuid(),
    revieweeId: z.string().uuid(),
    propertyId: z.string().uuid(),
    targetType: z.enum(REVIEW_TARGET_TYPES),
    rating: z.number().int().min(1).max(5),
    comment: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    reviewer: reviewUserSummarySchema.optional(),
    reviewee: reviewUserSummarySchema.optional(),
    property: reviewPropertySummarySchema.optional(),
  })
  .openapi('Review');

const reviewResponseSchema = successResponseSchema(reviewSchema).openapi(
  'ReviewResponse'
);

const reviewPaginatedResponseSchema = paginatedResponseSchema(
  reviewSchema
).openapi('ReviewPaginatedResponse');

const createReviewBodySchema = z
  .object({
    propertyId: z.string().uuid(),
    targetType: z.enum(REVIEW_TARGET_TYPES),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(1).optional(),
  })
  .openapi('CreateReviewBody');

const createReviewSchema = z.object({
  body: createReviewBodySchema,
});

const listReviewsSchema = z.object({
  query: paginationQuerySchema,
});

const getReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const listUserReviewsParamsSchema = z.object({
  id: z.string().uuid(),
});

const listUserReviewsSchema = z.object({
  params: listUserReviewsParamsSchema,
  query: paginationQuerySchema,
});

module.exports = {
  reviewSchema,
  reviewResponseSchema,
  reviewPaginatedResponseSchema,
  createReviewBodySchema,
  createReviewSchema,
  listReviewsSchema,
  getReviewSchema,
  listUserReviewsSchema,
};
