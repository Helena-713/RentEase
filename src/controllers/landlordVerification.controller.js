const AppError = require('../utils/AppError');
const landlordVerificationService = require('../services/landlordVerification.service');
const { buildVerificationDocumentPath } = require('../config/upload');
const { sendPaginatedResponse } = require('../utils/pagination');

const updateMe = async (req, res) => {
  if (!req.file) {
    throw new AppError('Verification document is required', 400);
  }

  const verification = await landlordVerificationService.updateMe(req.user.id, {
    verificationDocument: buildVerificationDocumentPath(req.file.filename),
    uploadedFilename: req.file.filename,
    log: req.log,
  });

  res.status(200).json({
    success: true,
    data: verification,
  });
};

const listPending = async (req, res) => {
  const { page, limit } = req.query;
  const result = await landlordVerificationService.listPending({ page, limit });
  sendPaginatedResponse(res, { ...result, page, limit });
};

const review = async (req, res) => {
  const verification = await landlordVerificationService.review(req.params.id, {
    status: req.body.status,
    rejectionReason: req.body.rejectionReason,
    adminId: req.user.id,
  });

  res.status(200).json({
    success: true,
    data: verification,
  });
};

module.exports = { updateMe, listPending, review };
