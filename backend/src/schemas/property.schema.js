const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const { paginationQuerySchema, paginatedResponseSchema } = require('./pagination.schema');
const { PROPERTY_TYPES } = require('../constants/propertyType');
const { PROPERTY_STATUSES } = require('../constants/propertyStatus');

const propertyImageSchema = z
  .object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    imageUrl: z.string(),
    isCover: z.boolean(),
    displayOrder: z.number().int(),
    createdAt: z.string().datetime(),
  })
  .openapi('PropertyImage');

const propertyAmenitySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
  })
  .openapi('PropertyAmenity');

const landlordSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })
  .openapi('PropertyLandlordSummary');

const propertySchema = z
  .object({
    id: z.string().uuid(),
    landlordId: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    price: z.number(),
    propertyType: z.enum(PROPERTY_TYPES),
    bedrooms: z.number().int(),
    bathrooms: z.number().int(),
    areaSqft: z.number().int(),
    status: z.enum(PROPERTY_STATUSES),
    isApproved: z.boolean(),
    rejectionReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    images: z.array(propertyImageSchema).optional(),
    amenities: z.array(propertyAmenitySchema).optional(),
    landlord: landlordSummarySchema.optional(),
  })
  .openapi('Property');

const propertyResponseSchema = successResponseSchema(propertySchema).openapi(
  'PropertyResponse'
);

const propertyListResponseSchema = successResponseSchema(
  z.array(propertySchema)
).openapi('PropertyListResponse');

const propertyPaginatedResponseSchema = paginatedResponseSchema(
  propertySchema
).openapi('PropertyPaginatedResponse');

const propertyFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  price: z.coerce.number().positive(),
  propertyType: z.enum(PROPERTY_TYPES),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  areaSqft: z.coerce.number().int().positive(),
});

const createPropertyBodySchema =
  propertyFieldsSchema.openapi('CreatePropertyBody');

const updatePropertyBodySchema = propertyFieldsSchema
  .partial()
  .openapi('UpdatePropertyBody');

const createPropertySchema = z.object({
  body: createPropertyBodySchema,
});

const updatePropertySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: updatePropertyBodySchema,
});

const propertyIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const propertyImageParamsSchema = z.object({
  id: z.string().uuid(),
  imageId: z.string().uuid(),
});

const getPropertySchema = z.object({
  params: propertyIdParamsSchema,
});

const getPublicPropertySchema = z.object({
  params: propertyIdParamsSchema,
});

const listPublicQuerySchema = paginationQuerySchema.extend({
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  bedroomsMin: z.coerce.number().int().min(0).optional(),
  bathroomsMin: z.coerce.number().int().min(0).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  areaMin: z.coerce.number().int().min(0).optional(),
  areaMax: z.coerce.number().int().min(0).optional(),
  q: z.string().min(1).optional(),
  amenityIds: z
    .string()
    .optional()
    .transform((s) => {
      if (!s) return undefined;
      const ids = s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      return ids.length ? ids : undefined;
    })
    .refine(
      (ids) => !ids || ids.every((id) => z.string().uuid().safeParse(id).success),
      { message: 'amenityIds must be a comma-separated list of UUIDs' }
    ),
});

const listPublicSchema = z.object({
  query: listPublicQuerySchema,
});

const listMineSchema = z.object({
  query: paginationQuerySchema,
});

const listPendingSchema = z.object({
  query: paginationQuerySchema,
});

const deleteImageSchema = z.object({
  params: propertyImageParamsSchema,
});

const setPropertyAmenitiesBodySchema = z
  .object({
    amenityIds: z.array(z.string().uuid()),
  })
  .openapi('SetPropertyAmenitiesBody');

const setPropertyAmenitiesSchema = z.object({
  params: propertyIdParamsSchema,
  body: setPropertyAmenitiesBodySchema,
});

const reviewBodySchema = z
  .object({
    isApproved: z.boolean(),
    rejectionReason: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.isApproved || !!data.rejectionReason?.trim(),
    {
      message: 'Rejection reason is required when rejecting',
      path: ['rejectionReason'],
    }
  )
  .openapi('ReviewPropertyBody');

const reviewSchema = z.object({
  params: propertyIdParamsSchema,
  body: reviewBodySchema,
});

const markAvailableSchema = z.object({
  params: propertyIdParamsSchema,
});

module.exports = {
  propertySchema,
  propertyResponseSchema,
  propertyListResponseSchema,
  propertyPaginatedResponseSchema,
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPublicPropertySchema,
  listPublicQuerySchema,
  listPublicSchema,
  listMineSchema,
  listPendingSchema,
  deleteImageSchema,
  setPropertyAmenitiesBodySchema,
  setPropertyAmenitiesSchema,
  reviewBodySchema,
  reviewSchema,
  markAvailableSchema,
};
