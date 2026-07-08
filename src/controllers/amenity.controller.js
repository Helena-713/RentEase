const amenityService = require('../services/amenity.service');
const { sendPaginatedResponse } = require('../utils/pagination');

const create = async (req, res) => {
  const amenity = await amenityService.create(req.body);

  res.status(201).json({
    success: true,
    data: amenity,
  });
};

const list = async (req, res) => {
  const { page, limit } = req.query;
  const result = await amenityService.list({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getById = async (req, res) => {
  const amenity = await amenityService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: amenity,
  });
};

module.exports = {
  create,
  list,
  getById,
};
