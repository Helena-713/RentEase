const { z } = require('../schemas/zod');

const idParamsSchema = z.object({
  id: z.string().uuid(),
});

const propertyImageParamsSchema = z.object({
  id: z.string().uuid(),
  imageId: z.string().uuid(),
});

module.exports = {
  idParamsSchema,
  propertyImageParamsSchema,
};
