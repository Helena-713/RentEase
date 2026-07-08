const { z } = require('./zod');

const errorDetailSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
});

const errorResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(errorDetailSchema),
  })
  .openapi('ErrorResponse');

const successResponseSchema = (dataSchema) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

module.exports = { errorResponseSchema, successResponseSchema };
