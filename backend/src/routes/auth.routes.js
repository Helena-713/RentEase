const express = require('express');
const validate = require('../middleware/validate');
const uploadProfileImage = require('../middleware/uploadProfileImage');
const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

const router = express.Router();

router.post(
  '/register',
  uploadProfileImage,
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(authController.login)
);

module.exports = router;
