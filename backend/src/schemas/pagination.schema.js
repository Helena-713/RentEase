const { z } = require('./zod');

const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .openapi('PaginationQuery');

const paginationMetaSchema = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi('PaginationMeta');

const paginatedResponseSchema = (itemSchema) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });

module.exports = {
  paginationQuerySchema,
  paginationMetaSchema,
  paginatedResponseSchema,
};
