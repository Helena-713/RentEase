const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const uploadProfileImage = require('../middleware/uploadProfileImage');
const uploadVerificationDocument = require('../middleware/uploadVerificationDocument');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const userController = require('../controllers/user.controller');
const landlordVerificationController = require('../controllers/landlordVerification.controller');
const {
  updateMeSchema,
  updateUserByIdSchema,
  listUsersSchema,
} = require('../schemas/user.schema');

const router = express.Router();

router.get('/me', authenticate, asyncHandler(userController.getMe));

router.get(
  '/',
  authenticate,
  authorizeAdmin,
  validate(listUsersSchema),
  asyncHandler(userController.listUsers)
);

router.patch(
  '/me/landlord-verification',
  authenticate,
  uploadVerificationDocument,
  asyncHandler(landlordVerificationController.updateMe)
);

router.patch(
  '/me',
  authenticate,
  uploadProfileImage,
  validate(updateMeSchema),
  asyncHandler(userController.updateMe)
);

router.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  uploadProfileImage,
  validate(updateUserByIdSchema),
  asyncHandler(userController.updateById)
);

module.exports = router;
