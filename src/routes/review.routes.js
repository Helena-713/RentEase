const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const reviewController = require('../controllers/review.controller');
const {
  createReviewSchema,
  listReviewsSchema,
  getReviewSchema,
} = require('../schemas/review.schema');
const { UserRole } = require('../constants/userRoles');
const { ReviewTargetType } = require('../constants/reviewTargetType');
const AppError = require('../utils/AppError');

const router = express.Router();

const authorizeReviewer = (req, res, next) => {
  if (
    req.user?.role !== UserRole.TENANT &&
    req.user?.role !== UserRole.LAND_LORD
  ) {
    return next(
      new AppError('Only tenants and landlords can create reviews', 403)
    );
  }
  next();
};

const validateCreateReviewRole = (req, res, next) => {
  const { targetType } = req.body;

  if (req.user.role === UserRole.TENANT && targetType !== ReviewTargetType.LANDLORD) {
    return next(new AppError('Tenants can only review landlords', 403));
  }

  if (
    req.user.role === UserRole.LAND_LORD &&
    targetType !== ReviewTargetType.TENANT
  ) {
    return next(new AppError('Landlords can only review tenants', 403));
  }

  next();
};

router.post(
  '/',
  authenticate,
  authorizeReviewer,
  validate(createReviewSchema),
  validateCreateReviewRole,
  asyncHandler(reviewController.create)
);

router.get(
  '/mine',
  authenticate,
  validate(listReviewsSchema),
  asyncHandler(reviewController.listMine)
);

router.get(
  '/received',
  authenticate,
  validate(listReviewsSchema),
  asyncHandler(reviewController.listReceived)
);

router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(listReviewsSchema),
  asyncHandler(reviewController.listAll)
);

router.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(getReviewSchema),
  asyncHandler(reviewController.getByIdAdmin)
);

module.exports = router;
