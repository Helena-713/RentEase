const { LandlordVerification, User } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { UserRole } = require('../constants/userRoles');
const {
  VerificationStatus,
  EDITABLE_STATUSES,
  REVIEW_STATUSES,
} = require('../constants/verificationStatus');
const {
  getVerificationDocumentFilename,
  deleteVerificationDocumentFile,
} = require('../config/upload');

const sanitizeUserSummary = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
});

const sanitizeVerification = (verification, { includeUser = false } = {}) => {
  const result = {
    id: verification.id,
    userId: verification.userId,
    status: verification.status,
    verificationDocument: verification.verificationDocument,
    rejectionReason: verification.rejectionReason,
    verifiedBy: verification.verifiedBy,
    verifiedAt: verification.verifiedAt,
    createdAt: verification.createdAt,
    updatedAt: verification.updatedAt,
  };

  if (includeUser && verification.user) {
    result.user = sanitizeUserSummary(verification.user);
  }

  return result;
};

const findByUserId = async (userId) => {
  const verification = await LandlordVerification.findOne({
    where: { userId },
  });

  if (!verification) {
    throw new AppError('Landlord verification not found', 404);
  }

  return verification;
};

const updateMe = async (
  userId,
  { verificationDocument, uploadedFilename, log: requestLog } = {}
) => {
  const log = requestLog || logger;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== UserRole.LAND_LORD) {
    throw new AppError('Only landlords can update verification', 403);
  }

  if (!verificationDocument) {
    throw new AppError('Verification document is required', 400);
  }

  const verification = await findByUserId(userId);

  if (!EDITABLE_STATUSES.includes(verification.status)) {
    throw new AppError('Verification cannot be updated in its current status', 403);
  }

  const oldFilename = getVerificationDocumentFilename(
    verification.verificationDocument
  );

  try {
    const updates = {
      verificationDocument,
    };

    if (verification.status === VerificationStatus.REJECTED) {
      updates.status = VerificationStatus.PENDING;
      updates.rejectionReason = null;
    }

    await verification.update(updates);

    if (oldFilename) {
      deleteVerificationDocumentFile(oldFilename);
    }

    return sanitizeVerification(verification);
  } catch (err) {
    if (uploadedFilename) {
      deleteVerificationDocumentFile(uploadedFilename);
    }

    if (!(err instanceof AppError)) {
      log.warn({ userId, err: err.message }, 'Landlord verification update failed');
    }

    throw err;
  }
};

const listPending = async () => {
  const verifications = await LandlordVerification.findAll({
    where: { status: VerificationStatus.PENDING },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return verifications.map((verification) =>
    sanitizeVerification(verification, { includeUser: true })
  );
};

const review = async (id, { status, rejectionReason, adminId }) => {
  if (!REVIEW_STATUSES.includes(status)) {
    throw new AppError('Invalid review status', 400);
  }

  if (status === VerificationStatus.REJECTED && !rejectionReason?.trim()) {
    throw new AppError('Rejection reason is required', 400);
  }

  const verification = await LandlordVerification.findByPk(id);

  if (!verification) {
    throw new AppError('Landlord verification not found', 404);
  }

  if (verification.status !== VerificationStatus.PENDING) {
    throw new AppError('Only pending verifications can be reviewed', 400);
  }

  if (status === VerificationStatus.VERIFIED) {
    await verification.update({
      status: VerificationStatus.VERIFIED,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      rejectionReason: null,
    });
  } else {
    await verification.update({
      status: VerificationStatus.REJECTED,
      rejectionReason: rejectionReason.trim(),
      verifiedBy: null,
      verifiedAt: null,
    });
  }

  return sanitizeVerification(verification);
};

module.exports = {
  sanitizeVerification,
  updateMe,
  listPending,
  review,
};
