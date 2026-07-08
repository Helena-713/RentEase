const express = require('express');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const conversationController = require('../controllers/conversation.controller');
const {
  createConversationSchema,
  listConversationsSchema,
  getConversationSchema,
  sendMessageSchema,
  listMessagesSchema,
  markConversationReadSchema,
} = require('../schemas/conversation.schema');
const { UserRole } = require('../constants/userRoles');
const AppError = require('../utils/AppError');

const router = express.Router();

const authorizeTenant = (req, res, next) => {
  if (req.user?.role !== UserRole.TENANT) {
    return next(new AppError('Only tenants can perform this action', 403));
  }
  next();
};

const authorizeLandlord = (req, res, next) => {
  if (req.user?.role !== UserRole.LAND_LORD) {
    return next(new AppError('Only landlords can perform this action', 403));
  }
  next();
};

router.post(
  '/',
  authenticate,
  authorizeTenant,
  validate(createConversationSchema),
  asyncHandler(conversationController.findOrCreate)
);

router.get(
  '/mine',
  authenticate,
  authorizeTenant,
  validate(listConversationsSchema),
  asyncHandler(conversationController.listForTenant)
);

router.get(
  '/landlord',
  authenticate,
  authorizeLandlord,
  validate(listConversationsSchema),
  asyncHandler(conversationController.listForLandlord)
);

router.get(
  '/:id',
  authenticate,
  validate(getConversationSchema),
  asyncHandler(conversationController.getById)
);

router.post(
  '/:id/messages',
  authenticate,
  validate(sendMessageSchema),
  asyncHandler(conversationController.sendMessage)
);

router.get(
  '/:id/messages',
  authenticate,
  validate(listMessagesSchema),
  asyncHandler(conversationController.listMessages)
);

router.patch(
  '/:id/read',
  authenticate,
  validate(markConversationReadSchema),
  asyncHandler(conversationController.markAsRead)
);

module.exports = router;
