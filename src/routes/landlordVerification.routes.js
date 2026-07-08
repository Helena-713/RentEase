const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const landlordVerificationController = require('../controllers/landlordVerification.controller');
const { reviewSchema } = require('../schemas/landlordVerification.schema');

const router = express.Router();

router.get(
  '/pending',
  authenticate,
  authorizeAdmin,
  asyncHandler(landlordVerificationController.listPending)
);

router.patch(
  '/:id/review',
  authenticate,
  authorizeAdmin,
  validate(reviewSchema),
  asyncHandler(landlordVerificationController.review)
);

module.exports = router;
