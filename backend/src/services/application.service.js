const { Op } = require('sequelize');
const { Application, Property, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const {
  ApplicationStatus,
  TERMINAL_APPLICATION_STATUSES,
} = require('../constants/applicationStatus');
const { PropertyStatus } = require('../constants/propertyStatus');
const { getPaginationOptions } = require('../utils/pagination');

const propertySummaryAttributes = [
  'id',
  'title',
  'address',
  'city',
  'state',
  'price',
  'status',
  'isApproved',
  'landlordId',
];

const tenantSummaryAttributes = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
];

const propertyInclude = {
  model: Property,
  as: 'property',
  attributes: propertySummaryAttributes,
};

const tenantInclude = {
  model: User,
  as: 'tenant',
  attributes: tenantSummaryAttributes,
};

const sanitizePropertySummary = (property) => ({
  id: property.id,
  title: property.title,
  address: property.address,
  city: property.city,
  state: property.state,
  price: Number(property.price),
  status: property.status,
  isApproved: property.isApproved,
});

const sanitizeTenantSummary = (tenant) => ({
  id: tenant.id,
  firstName: tenant.firstName,
  lastName: tenant.lastName,
  email: tenant.email,
  phone: tenant.phone,
});

const sanitizeApplication = (
  application,
  { includeProperty = false, includeTenant = false } = {}
) => {
  const result = {
    id: application.id,
    propertyId: application.propertyId,
    tenantId: application.tenantId,
    message: application.message,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };

  if (includeProperty && application.property) {
    result.property = sanitizePropertySummary(application.property);
  }

  if (includeTenant && application.tenant) {
    result.tenant = sanitizeTenantSummary(application.tenant);
  }

  return result;
};

const buildStatusFilter = (status) => (status ? { status } : {});

const findApplicationWithAssociations = async (applicationId, options = {}) => {
  const application = await Application.findByPk(applicationId, {
    include: [propertyInclude, tenantInclude],
    ...options,
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  return application;
};

const ensurePropertyEligibleForApplication = (property) => {
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  if (!property.isApproved) {
    throw new AppError('Property is not approved for rental', 400);
  }

  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError('Property is not available for applications', 400);
  }
};

const create = async ({ tenantId, propertyId, message }) => {
  const property = await Property.findByPk(propertyId);
  ensurePropertyEligibleForApplication(property);

  const existingPending = await Application.findOne({
    where: {
      propertyId,
      tenantId,
      status: ApplicationStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new AppError(
      'You already have a pending application for this property',
      409
    );
  }

  const application = await Application.create({
    propertyId,
    tenantId,
    message: message?.trim() || null,
    status: ApplicationStatus.PENDING,
  });

  return findApplicationWithAssociations(application.id).then((app) =>
    sanitizeApplication(app, { includeProperty: true })
  );
};

const approve = async (applicationId, landlordId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.property.landlordId !== landlordId) {
    throw new AppError('Forbidden', 403);
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new AppError('Only pending applications can be approved', 409);
  }

  if (application.property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError('Property is not available for approval', 409);
  }

  const transaction = await sequelize.transaction();

  try {
    await application.update(
      { status: ApplicationStatus.APPROVED },
      { transaction }
    );

    await Property.update(
      { status: PropertyStatus.RESERVED },
      { where: { id: application.propertyId }, transaction }
    );

    await Application.update(
      { status: ApplicationStatus.REJECTED },
      {
        where: {
          propertyId: application.propertyId,
          id: { [Op.ne]: application.id },
          status: ApplicationStatus.PENDING,
        },
        transaction,
      }
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return findApplicationWithAssociations(applicationId).then((app) =>
    sanitizeApplication(app, { includeProperty: true, includeTenant: true })
  );
};

const reject = async (applicationId, landlordId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.property.landlordId !== landlordId) {
    throw new AppError('Forbidden', 403);
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new AppError('Only pending applications can be rejected', 409);
  }

  await application.update({ status: ApplicationStatus.REJECTED });

  return sanitizeApplication(application, {
    includeProperty: true,
    includeTenant: true,
  });
};

const markRented = async (applicationId, landlordId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.property.landlordId !== landlordId) {
    throw new AppError('Forbidden', 403);
  }

  if (application.status !== ApplicationStatus.APPROVED) {
    throw new AppError(
      'Only approved applications can be marked as rented',
      409
    );
  }

  if (application.property.status !== PropertyStatus.RESERVED) {
    throw new AppError('Property must be reserved before marking as rented', 409);
  }

  const transaction = await sequelize.transaction();

  try {
    await Property.update(
      { status: PropertyStatus.RENTED },
      { where: { id: application.propertyId }, transaction }
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await application.reload({ include: [propertyInclude, tenantInclude] });
  application.property.status = PropertyStatus.RENTED;

  return sanitizeApplication(application, {
    includeProperty: true,
    includeTenant: true,
  });
};

const withdraw = async (applicationId, tenantId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.tenantId !== tenantId) {
    throw new AppError('Forbidden', 403);
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new AppError('Only pending applications can be withdrawn', 409);
  }

  await application.update({ status: ApplicationStatus.WITHDRAWN });

  return sanitizeApplication(application, { includeProperty: true });
};

const cancel = async (applicationId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (TERMINAL_APPLICATION_STATUSES.includes(application.status)) {
    throw new AppError('Application cannot be cancelled in its current state', 409);
  }

  await application.update({ status: ApplicationStatus.CANCELLED });

  return sanitizeApplication(application, {
    includeProperty: true,
    includeTenant: true,
  });
};

const listForTenant = async (tenantId, { page, limit, status }) => {
  const { rows, count } = await Application.findAndCountAll({
    where: {
      tenantId,
      ...buildStatusFilter(status),
    },
    include: [propertyInclude],
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((application) =>
      sanitizeApplication(application, { includeProperty: true })
    ),
    total: count,
  };
};

const listForLandlord = async (landlordId, { page, limit, status }) => {
  const { rows, count } = await Application.findAndCountAll({
    where: buildStatusFilter(status),
    include: [
      {
        ...propertyInclude,
        where: { landlordId },
        required: true,
      },
      tenantInclude,
    ],
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((application) =>
      sanitizeApplication(application, {
        includeProperty: true,
        includeTenant: true,
      })
    ),
    total: count,
  };
};

const listAll = async ({ page, limit, status }) => {
  const { rows, count } = await Application.findAndCountAll({
    where: buildStatusFilter(status),
    include: [propertyInclude, tenantInclude],
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((application) =>
      sanitizeApplication(application, {
        includeProperty: true,
        includeTenant: true,
      })
    ),
    total: count,
  };
};

const getForTenant = async (applicationId, tenantId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.tenantId !== tenantId) {
    throw new AppError('Forbidden', 403);
  }

  return sanitizeApplication(application, { includeProperty: true });
};

const getForLandlord = async (applicationId, landlordId) => {
  const application = await findApplicationWithAssociations(applicationId);

  if (application.property.landlordId !== landlordId) {
    throw new AppError('Forbidden', 403);
  }

  return sanitizeApplication(application, {
    includeProperty: true,
    includeTenant: true,
  });
};

const getByIdAdmin = async (applicationId) => {
  const application = await findApplicationWithAssociations(applicationId);

  return sanitizeApplication(application, {
    includeProperty: true,
    includeTenant: true,
  });
};

module.exports = {
  sanitizeApplication,
  create,
  approve,
  reject,
  markRented,
  withdraw,
  cancel,
  listForTenant,
  listForLandlord,
  listAll,
  getForTenant,
  getForLandlord,
  getByIdAdmin,
};
