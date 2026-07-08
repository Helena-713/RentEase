const { User, LandlordVerification, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { deleteProfileImageFile } = require('../config/upload');
const { sanitizeUser } = require('./user.service');
const { UserRole } = require('../constants/userRoles');
const { VerificationStatus } = require('../constants/verificationStatus');

const issueAuthResponse = (user) => {
  const { token, expiresAt } = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    expiresAt,
    user: sanitizeUser(user),
  };
};

const register = async (data, { uploadedFilename, log: requestLog } = {}) => {
  const log = requestLog || logger;

  const hashedPassword = await hashPassword(data.password);
  const transaction = await sequelize.transaction();

  try {
    const user = await User.create(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
        profileImage: data.profileImage ?? null,
        isActive: true,
      },
      { transaction }
    );

    if (data.role === UserRole.LAND_LORD) {
      await LandlordVerification.create(
        {
          userId: user.id,
          status: VerificationStatus.PENDING,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return issueAuthResponse(user);
  } catch (err) {
    await transaction.rollback();

    if (uploadedFilename) {
      deleteProfileImageFile(uploadedFilename);
    }

    log.warn(
      {
        email: data.email,
        err: err.message,
        ...(uploadedFilename && { deletedFile: uploadedFilename }),
      },
      'Registration failed'
    );

    throw err;
  }
};

const login = async ({ email, password }, { log: requestLog } = {}) => {
  const log = requestLog || logger;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    log.warn({ email }, 'Login failed: invalid credentials');
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    log.warn({ email }, 'Login failed: invalid credentials');
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    log.warn({ email, userId: user.id }, 'Login failed: account inactive');
    throw new AppError('Account is inactive', 403);
  }

  return issueAuthResponse(user);
};

module.exports = { register, login };
