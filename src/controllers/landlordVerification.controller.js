const AppError = require('../utils/AppError');
const landlordVerificationService = require('../services/landlordVerification.service');
const { buildVerificationDocumentPath } = require('../config/upload');

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

const listPending = async (_req, res) => {
  const verifications = await landlordVerificationService.listPending();

  res.status(200).json({
    success: true,
    data: verifications,
  });
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
