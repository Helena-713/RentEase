const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');

const healthDataSchema = z
  .object({
    status: z.literal('ok'),
    timestamp: z.string().datetime(),
  })
  .openapi('HealthData');

const healthResponseSchema = successResponseSchema(healthDataSchema).openapi(
  'HealthResponse'
);

module.exports = { healthDataSchema, healthResponseSchema };
