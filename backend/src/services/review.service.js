const { Review, Application, Property, User } = require('../models');
const AppError = require('../utils/AppError');
const { ApplicationStatus } = require('../constants/applicationStatus');
const { ReviewTargetType } = require('../constants/reviewTargetType');
const { UserRole } = require('../constants/userRoles');
const { getPaginationOptions } = require('../utils/pagination');
const { UniqueConstraintError } = require('sequelize');

const userSummaryAttributes = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
];

const propertySummaryAttributes = ['id', 'title', 'address', 'city', 'state'];

const reviewerInclude = {
  model: User,
  as: 'reviewer',
  attributes: userSummaryAttributes,
};

const revieweeInclude = {
  model: User,
  as: 'reviewee',
  attributes: userSummaryAttributes,
};

const propertyInclude = {
  model: Property,
  as: 'property',
  attributes: propertySummaryAttributes,
};

const reviewIncludes = [reviewerInclude, revieweeInclude, propertyInclude];

const sanitizeUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
});

const sanitizePropertySummary = (property) => ({
  id: property.id,
  title: property.title,
  address: property.address,
  city: property.city,
  state: property.state,
});

const sanitizeReview = (
  review,
  { includeReviewer = false, includeReviewee = false, includeProperty = false } = {}
) => {
  const result = {
    id: review.id,
    reviewerId: review.reviewerId,
    revieweeId: review.revieweeId,
    propertyId: review.propertyId,
    applicationId: review.applicationId ?? null,
    targetType: review.targetType,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };

  if (includeReviewer && review.reviewer) {
    result.reviewer = sanitizeUserSummary(review.reviewer);
  }

  if (includeReviewee && review.reviewee) {
    result.reviewee = sanitizeUserSummary(review.reviewee);
  }

  if (includeProperty && review.property) {
    result.property = sanitizePropertySummary(review.property);
  }

  return result;
};

const completedApplicationInclude = [
  {
    model: Property,
    as: 'property',
    attributes: ['id', 'landlordId'],
  },
];

const ensureCompleted = (application) => {
  if (!application || application.status !== ApplicationStatus.COMPLETED) {
    throw new AppError(
      'Reviews are only allowed after a rental has been completed',
      409
    );
  }
};

const findCompletedApplicationForCreate = async ({
  propertyId,
  applicationId,
  reviewerId,
  reviewerRole,
  targetType,
}) => {
  if (applicationId) {
    const application = await Application.findByPk(applicationId, {
      include: completedApplicationInclude,
    });

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    ensureCompleted(application);

    if (propertyId && application.propertyId !== propertyId) {
      throw new AppError('Application does not match property', 409);
    }

    if (targetType === ReviewTargetType.LANDLORD) {
      if (reviewerRole !== UserRole.TENANT || application.tenantId !== reviewerId) {
        throw new AppError('Only the tenant can review the landlord', 403);
      }
    } else if (targetType === ReviewTargetType.TENANT) {
      if (
        reviewerRole !== UserRole.LAND_LORD ||
        application.property?.landlordId !== reviewerId
      ) {
        throw new AppError('Only the landlord can review the tenant', 403);
      }
    } else {
      throw new AppError('Invalid review target type', 400);
    }

    return application;
  }

  // Backward-compat path: resolve the correct completed application.
  if (targetType === ReviewTargetType.LANDLORD) {
    if (reviewerRole !== UserRole.TENANT) {
      throw new AppError('Only the tenant can review the landlord', 403);
    }

    const application = await Application.findOne({
      where: {
        propertyId,
        tenantId: reviewerId,
        status: ApplicationStatus.COMPLETED,
      },
      include: completedApplicationInclude,
      order: [['updatedAt', 'DESC'], ['createdAt', 'DESC']],
    });

    if (!application) {
      throw new AppError(
        'Reviews are only allowed after a rental has been completed',
        409
      );
    }

    return application;
  }

  // Landlord reviews are ambiguous without specifying which completed rental.
  if (targetType === ReviewTargetType.TENANT) {
    throw new AppError('applicationId is required for landlord reviews', 409);
  }

  throw new AppError('Invalid review target type', 400);
};

const resolveReviewParticipants = (application, reviewerId, reviewerRole, targetType) => {
  const tenantId = application.tenantId;
  const landlordId = application.property.landlordId;

  if (targetType === ReviewTargetType.LANDLORD) {
    if (reviewerRole !== UserRole.TENANT || reviewerId !== tenantId) {
      throw new AppError('Only the tenant can review the landlord', 403);
    }

    return landlordId;
  }

  if (targetType === ReviewTargetType.TENANT) {
    if (reviewerRole !== UserRole.LAND_LORD || reviewerId !== landlordId) {
      throw new AppError('Only the landlord can review the tenant', 403);
    }

    return tenantId;
  }

  throw new AppError('Invalid review target type', 400);
};

const create = async ({
  reviewerId,
  reviewerRole,
  propertyId,
  applicationId,
  targetType,
  rating,
  comment,
}) => {
  const application = await findCompletedApplicationForCreate({
    propertyId,
    applicationId,
    reviewerId,
    reviewerRole,
    targetType,
  });
  const revieweeId = resolveReviewParticipants(
    application,
    reviewerId,
    reviewerRole,
    targetType
  );

  if (reviewerId === revieweeId) {
    throw new AppError('You cannot review yourself', 400);
  }

  let review;
  try {
    review = await Review.create({
      reviewerId,
      revieweeId,
      propertyId: application.propertyId,
      applicationId: application.id,
      targetType,
      rating,
      comment: comment?.trim() || null,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new AppError('You already submitted this review for this rental', 409);
    }
    throw err;
  }

  const created = await Review.findByPk(review.id, {
    include: reviewIncludes,
  });

  return sanitizeReview(created, {
    includeReviewer: true,
    includeReviewee: true,
    includeProperty: true,
  });
};

const listMine = async (reviewerId, { page, limit }) => {
  const { rows, count } = await Review.findAndCountAll({
    where: { reviewerId },
    include: [revieweeInclude, propertyInclude],
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((review) =>
      sanitizeReview(review, { includeReviewee: true, includeProperty: true })
    ),
    total: count,
  };
};

const listReceived = async (revieweeId, { page, limit }) => {
  const { rows, count } = await Review.findAndCountAll({
    where: { revieweeId },
    include: [reviewerInclude, propertyInclude],
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((review) =>
      sanitizeReview(review, { includeReviewer: true, includeProperty: true })
    ),
    total: count,
  };
};

const listForUser = async (userId, { page, limit }) => {
  const user = await User.findByPk(userId, { attributes: ['id'] });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return listReceived(userId, { page, limit });
};

const listAll = async ({ page, limit }) => {
  const { rows, count } = await Review.findAndCountAll({
    include: reviewIncludes,
    distinct: true,
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map((review) =>
      sanitizeReview(review, {
        includeReviewer: true,
        includeReviewee: true,
        includeProperty: true,
      })
    ),
    total: count,
  };
};

const getByIdAdmin = async (reviewId) => {
  const review = await Review.findByPk(reviewId, {
    include: reviewIncludes,
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  return sanitizeReview(review, {
    includeReviewer: true,
    includeReviewee: true,
    includeProperty: true,
  });
};

module.exports = {
  sanitizeReview,
  create,
  listMine,
  listReceived,
  listForUser,
  listAll,
  getByIdAdmin,
};
