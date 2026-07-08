const propertyService = require('../services/property.service');
const { sendPaginatedResponse } = require('../utils/pagination');

const create = async (req, res) => {
  const property = await propertyService.create(
    req.user.id,
    req.body,
    req.files,
    { log: req.log }
  );

  res.status(201).json({
    success: true,
    data: property,
  });
};

const listPublic = async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.listPublic({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const listMine = async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.listMine(req.user.id, { page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getPublicById = async (req, res) => {
  const property = await propertyService.getPublicById(req.params.id);

  res.status(200).json({
    success: true,
    data: property,
  });
};

const getById = async (req, res) => {
  const property = await propertyService.getByIdForOwner(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: property,
  });
};

const update = async (req, res) => {
  const property = await propertyService.update(
    req.params.id,
    req.user.id,
    req.body,
    req.files,
    { log: req.log }
  );

  res.status(200).json({
    success: true,
    data: property,
  });
};

const deleteImage = async (req, res) => {
  const property = await propertyService.deleteImage(
    req.params.id,
    req.params.imageId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: property,
  });
};

const setAmenities = async (req, res) => {
  const property = await propertyService.setAmenities(
    req.params.id,
    req.body.amenityIds,
    {
      userId: req.user.id,
      userRole: req.user.role,
    }
  );

  res.status(200).json({
    success: true,
    data: property,
  });
};

const listPending = async (req, res) => {
  const { page, limit } = req.query;
  const result = await propertyService.listPending({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const review = async (req, res) => {
  const property = await propertyService.review(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: property,
  });
};

const markAvailable = async (req, res) => {
  const property = await propertyService.markAvailable(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: property,
  });
};

module.exports = {
  create,
  listPublic,
  listMine,
  getPublicById,
  getById,
  update,
  deleteImage,
  setAmenities,
  listPending,
  review,
  markAvailable,
};
