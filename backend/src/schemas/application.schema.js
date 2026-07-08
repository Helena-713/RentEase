const { z } = require('./zod');
const { successResponseSchema } = require('./common.schema');
const {
  paginationQuerySchema,
  paginatedResponseSchema,
} = require('./pagination.schema');
const { APPLICATION_STATUSES } = require('../constants/applicationStatus');
const { PROPERTY_STATUSES } = require('../constants/propertyStatus');

const applicationPropertySummarySchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    price: z.number(),
    status: z.enum(PROPERTY_STATUSES),
    isApproved: z.boolean(),
  })
  .openapi('ApplicationPropertySummary');

const applicationTenantSummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  })
  .openapi('ApplicationTenantSummary');

const applicationSchema = z
  .object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    message: z.string().nullable(),
    status: z.enum(APPLICATION_STATUSES),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    property: applicationPropertySummarySchema.optional(),
    tenant: applicationTenantSummarySchema.optional(),
  })
  .openapi('Application');

const applicationResponseSchema = successResponseSchema(
  applicationSchema
).openapi('ApplicationResponse');

const applicationPaginatedResponseSchema = paginatedResponseSchema(
  applicationSchema
).openapi('ApplicationPaginatedResponse');

const createApplicationBodySchema = z
  .object({
    propertyId: z.string().uuid(),
    message: z.string().trim().min(1).optional(),
  })
  .openapi('CreateApplicationBody');

const createApplicationSchema = z.object({
  body: createApplicationBodySchema,
});

const listApplicationsQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(APPLICATION_STATUSES).optional(),
  })
  .openapi('ListApplicationsQuery');

const listApplicationsSchema = z.object({
  query: listApplicationsQuerySchema,
});

const getApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const getMineApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const getLandlordApplicationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const applicationActionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

module.exports = {
  applicationSchema,
  applicationResponseSchema,
  applicationPaginatedResponseSchema,
  createApplicationBodySchema,
  createApplicationSchema,
  listApplicationsQuerySchema,
  listApplicationsSchema,
  getApplicationSchema,
  getMineApplicationSchema,
  getLandlordApplicationSchema,
  applicationActionSchema,
};
