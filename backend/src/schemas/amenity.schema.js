const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const {
  paginationQuerySchema,
  paginatedResponseSchema,
} = require('./pagination.schema');

const amenitySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('Amenity');

const amenityResponseSchema = successResponseSchema(amenitySchema).openapi(
  'AmenityResponse'
);

const amenityPaginatedResponseSchema = paginatedResponseSchema(
  amenitySchema
).openapi('AmenityPaginatedResponse');

const createAmenityBodySchema = z
  .object({
    name: z.string().trim().min(1),
  })
  .openapi('CreateAmenityBody');

const createAmenitySchema = z.object({
  body: createAmenityBodySchema,
});

const listAmenitiesSchema = z.object({
  query: paginationQuerySchema,
});

const getAmenitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

module.exports = {
  amenitySchema,
  amenityResponseSchema,
  amenityPaginatedResponseSchema,
  createAmenityBodySchema,
  createAmenitySchema,
  listAmenitiesSchema,
  getAmenitySchema,
};
