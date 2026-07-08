const { LandlordVerification } = require('../models');
const AppError = require('../utils/AppError');
const { UserRole } = require('../constants/userRoles');
const { VerificationStatus } = require('../constants/verificationStatus');

const authorizeVerifiedLandlord = async (req, res, next) => {
  if (req.user?.role !== UserRole.LAND_LORD) {
    return next(new AppError('Only landlords can perform this action', 403));
  }

  const verification = await LandlordVerification.findOne({
    where: { userId: req.user.id },
  });

  if (!verification) {
    return next(new AppError('Landlord verification not found', 404));
  }

  if (verification.status !== VerificationStatus.VERIFIED) {
    return next(
      new AppError('Only verified landlords can perform this action', 403)
    );
  }

  next();
};

module.exports = authorizeVerifiedLandlord;
