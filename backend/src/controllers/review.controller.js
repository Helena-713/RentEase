const reviewService = require('../services/review.service');
const { sendPaginatedResponse } = require('../utils/pagination');

const create = async (req, res) => {
  const review = await reviewService.create({
    reviewerId: req.user.id,
    reviewerRole: req.user.role,
    propertyId: req.body.propertyId,
    targetType: req.body.targetType,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
};

const listMine = async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.listMine(req.user.id, { page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const listReceived = async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.listReceived(req.user.id, { page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const listAll = async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.listAll({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getByIdAdmin = async (req, res) => {
  const review = await reviewService.getByIdAdmin(req.params.id);

  res.status(200).json({
    success: true,
    data: review,
  });
};

module.exports = {
  create,
  listMine,
  listReceived,
  listAll,
  getByIdAdmin,
};
