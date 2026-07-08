const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const applicationController = require('../controllers/application.controller');
const {
  createApplicationSchema,
  listApplicationsSchema,
  getApplicationSchema,
  getMineApplicationSchema,
  getLandlordApplicationSchema,
  applicationActionSchema,
} = require('../schemas/application.schema');
const { UserRole } = require('../constants/userRoles');
const AppError = require('../utils/AppError');

const router = express.Router();

const authorizeTenant = (req, res, next) => {
  if (req.user?.role !== UserRole.TENANT) {
    return next(new AppError('Only tenants can perform this action', 403));
  }
  next();
};

const authorizeLandlord = (req, res, next) => {
  if (req.user?.role !== UserRole.LAND_LORD) {
    return next(new AppError('Only landlords can perform this action', 403));
  }
  next();
};

router.post(
  '/',
  authenticate,
  authorizeTenant,
  validate(createApplicationSchema),
  asyncHandler(applicationController.create)
);

router.get(
  '/mine',
  authenticate,
  authorizeTenant,
  validate(listApplicationsSchema),
  asyncHandler(applicationController.listForTenant)
);

router.get(
  '/mine/:id',
  authenticate,
  authorizeTenant,
  validate(getMineApplicationSchema),
  asyncHandler(applicationController.getForTenant)
);

router.get(
  '/landlord',
  authenticate,
  authorizeLandlord,
  validate(listApplicationsSchema),
  asyncHandler(applicationController.listForLandlord)
);

router.get(
  '/landlord/:id',
  authenticate,
  authorizeLandlord,
  validate(getLandlordApplicationSchema),
  asyncHandler(applicationController.getForLandlord)
);

router.patch(
  '/:id/approve',
  authenticate,
  authorizeLandlord,
  validate(applicationActionSchema),
  asyncHandler(applicationController.approve)
);

router.patch(
  '/:id/reject',
  authenticate,
  authorizeLandlord,
  validate(applicationActionSchema),
  asyncHandler(applicationController.reject)
);

router.patch(
  '/:id/rent',
  authenticate,
  authorizeLandlord,
  validate(applicationActionSchema),
  asyncHandler(applicationController.markRented)
);

router.patch(
  '/:id/withdraw',
  authenticate,
  authorizeTenant,
  validate(applicationActionSchema),
  asyncHandler(applicationController.withdraw)
);

router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(listApplicationsSchema),
  asyncHandler(applicationController.listAll)
);

router.get(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(getApplicationSchema),
  asyncHandler(applicationController.getByIdAdmin)
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorizeAdmin,
  validate(applicationActionSchema),
  asyncHandler(applicationController.cancel)
);

module.exports = router;
