const conversationService = require('../services/conversation.service');
const { sendPaginatedResponse } = require('../utils/pagination');

const findOrCreate = async (req, res) => {
  const result = await conversationService.findOrCreate({
    tenantId: req.user.id,
    propertyId: req.body.propertyId,
  });

  res.status(result.created ? 201 : 200).json({
    success: true,
    data: result.conversation,
  });
};

const listForTenant = async (req, res) => {
  const { page, limit } = req.query;
  const result = await conversationService.listForTenant(req.user.id, {
    page,
    limit,
  });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const listForLandlord = async (req, res) => {
  const { page, limit } = req.query;
  const result = await conversationService.listForLandlord(req.user.id, {
    page,
    limit,
  });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const getById = async (req, res) => {
  const conversation = await conversationService.getById(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: conversation,
  });
};

const sendMessage = async (req, res) => {
  const message = await conversationService.sendMessage(
    req.params.id,
    req.user.id,
    req.body.message
  );

  res.status(201).json({
    success: true,
    data: message,
  });
};

const listMessages = async (req, res) => {
  const { page, limit } = req.query;
  const result = await conversationService.listMessages(
    req.params.id,
    req.user.id,
    { page, limit }
  );
  sendPaginatedResponse(res, { ...result, page, limit });
};

const markAsRead = async (req, res) => {
  const result = await conversationService.markAsRead(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

module.exports = {
  findOrCreate,
  listForTenant,
  listForLandlord,
  getById,
  sendMessage,
  listMessages,
  markAsRead,
};
