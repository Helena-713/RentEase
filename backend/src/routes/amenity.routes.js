const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const amenityController = require('../controllers/amenity.controller');
const {
  createAmenitySchema,
  listAmenitiesSchema,
  getAmenitySchema,
} = require('../schemas/amenity.schema');

const router = express.Router();

router.get(
  '/',
  validate(listAmenitiesSchema),
  asyncHandler(amenityController.list)
);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createAmenitySchema),
  asyncHandler(amenityController.create)
);

router.get(
  '/:id',
  validate(getAmenitySchema),
  asyncHandler(amenityController.getById)
);

module.exports = router;
