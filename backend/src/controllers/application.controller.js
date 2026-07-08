const applicationService = require('../services/application.service');
const { sendPaginatedResponse } = require('../utils/pagination');

const create = async (req, res) => {
  const application = await applicationService.create({
    tenantId: req.user.id,
    propertyId: req.body.propertyId,
    message: req.body.message,
  });

  res.status(201).json({
    success: true,
    data: application,
  });
};

const listForTenant = async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await applicationService.listForTenant(req.user.id, {
    page,
    limit,
    status,
  });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getForTenant = async (req, res) => {
  const application = await applicationService.getForTenant(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const listForLandlord = async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await applicationService.listForLandlord(req.user.id, {
    page,
    limit,
    status,
  });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getForLandlord = async (req, res) => {
  const application = await applicationService.getForLandlord(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const listAll = async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await applicationService.listAll({ page, limit, status });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getByIdAdmin = async (req, res) => {
  const application = await applicationService.getByIdAdmin(req.params.id);

  res.status(200).json({
    success: true,
    data: application,
  });
};

const approve = async (req, res) => {
  const application = await applicationService.approve(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const reject = async (req, res) => {
  const application = await applicationService.reject(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const markRented = async (req, res) => {
  const application = await applicationService.markRented(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const withdraw = async (req, res) => {
  const application = await applicationService.withdraw(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
};

const cancel = async (req, res) => {
  const application = await applicationService.cancel(req.params.id);

  res.status(200).json({
    success: true,
    data: application,
  });
};

module.exports = {
  create,
  listForTenant,
  getForTenant,
  listForLandlord,
  getForLandlord,
  listAll,
  getByIdAdmin,
  approve,
  reject,
  markRented,
  withdraw,
  cancel,
};
