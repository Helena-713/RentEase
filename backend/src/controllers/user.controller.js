const AppError = require('../utils/AppError');
const userService = require('../services/user.service');
const reviewService = require('../services/review.service');
const { buildProfileImagePath } = require('../config/upload');
const { sendPaginatedResponse } = require('../utils/pagination');

const UPDATABLE_FIELDS = ['firstName', 'lastName', 'phone', 'password'];

const assertHasUpdates = (body, file) => {
  const hasBodyUpdate = UPDATABLE_FIELDS.some((field) => body[field] !== undefined);

  if (!hasBodyUpdate && !file) {
    throw new AppError('At least one field must be provided', 400);
  }
};

const buildUpdateData = (body, file) => ({
  ...body,
  ...(file ? { profileImage: buildProfileImagePath(file.filename) } : {}),
});

const getMe = async (req, res) => {
  const user = await userService.getMe(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

const listUsers = async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.listUsers({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const updateMe = async (req, res) => {
  assertHasUpdates(req.body, req.file);

  const data = buildUpdateData(req.body, req.file);

  const user = await userService.updateMe(req.user.id, data, {
    uploadedFilename: req.file?.filename,
    log: req.log,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

const updateById = async (req, res) => {
  assertHasUpdates(req.body, req.file);

  const data = buildUpdateData(req.body, req.file);

  const user = await userService.updateById(req.params.id, data, {
    uploadedFilename: req.file?.filename,
    log: req.log,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

const listReviews = async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.listForUser(req.params.id, { page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

module.exports = { getMe, listUsers, updateMe, updateById, listReviews };
