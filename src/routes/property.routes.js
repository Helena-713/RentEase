const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const authorizeVerifiedLandlord = require('../middleware/authorizeVerifiedLandlord');
const uploadPropertyImages = require('../middleware/uploadPropertyImages');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const propertyController = require('../controllers/property.controller');
const {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  getPublicPropertySchema,
  listPublicSchema,
  listMineSchema,
  listPendingSchema,
  deleteImageSchema,
  reviewSchema,
} = require('../schemas/property.schema');
const { UserRole } = require('../constants/userRoles');
const AppError = require('../utils/AppError');

const router = express.Router();

const authorizeLandlord = (req, res, next) => {
  if (req.user?.role !== UserRole.LAND_LORD) {
    return next(new AppError('Only landlords can perform this action', 403));
  }
  next();
};

router.get(
  '/',
  validate(listPublicSchema),
  asyncHandler(propertyController.listPublic)
);

router.get(
  '/pending',
  authenticate,
  authorizeAdmin,
  validate(listPendingSchema),
  asyncHandler(propertyController.listPending)
);

router.get(
  '/mine',
  authenticate,
  authorizeLandlord,
  validate(listMineSchema),
  asyncHandler(propertyController.listMine)
);

router.get(
  '/public/:id',
  validate(getPublicPropertySchema),
  asyncHandler(propertyController.getPublicById)
);

router.post(
  '/',
  authenticate,
  authorizeVerifiedLandlord,
  uploadPropertyImages,
  validate(createPropertySchema),
  asyncHandler(propertyController.create)
);

router.get(
  '/:id',
  authenticate,
  authorizeLandlord,
  validate(getPropertySchema),
  asyncHandler(propertyController.getById)
);

router.patch(
  '/:id/review',
  authenticate,
  authorizeAdmin,
  validate(reviewSchema),
  asyncHandler(propertyController.review)
);

router.patch(
  '/:id',
  authenticate,
  authorizeLandlord,
  uploadPropertyImages,
  validate(updatePropertySchema),
  asyncHandler(propertyController.update)
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorizeLandlord,
  validate(deleteImageSchema),
  asyncHandler(propertyController.deleteImage)
);

module.exports = router;
