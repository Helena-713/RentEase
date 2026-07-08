const AppError = require('../utils/AppError');
const propertyService = require('../services/property.service');

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

const listMine = async (req, res) => {
  const properties = await propertyService.listMine(req.user.id);

  res.status(200).json({
    success: true,
    data: properties,
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

const listPending = async (_req, res) => {
  const properties = await propertyService.listPending();

  res.status(200).json({
    success: true,
    data: properties,
  });
};

const review = async (req, res) => {
  const property = await propertyService.review(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: property,
  });
};

module.exports = {
  create,
  listMine,
  getById,
  update,
  deleteImage,
  listPending,
  review,
};
