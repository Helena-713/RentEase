const { User, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { getPaginationOptions } = require('../utils/pagination');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  deleteProfileImageFile,
  getProfileImageFilename,
} = require('../config/upload');

const sanitizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  isActive: user.isActive,
});

const buildUpdatePayload = async (data, user) => {
  const updates = {};

  if (data.firstName !== undefined) {
    updates.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updates.lastName = data.lastName;
  }
  if (data.phone !== undefined) {
    updates.phone = data.phone;
  }
  if (data.profileImage !== undefined) {
    updates.profileImage = data.profileImage;
  }
  if (data.password !== undefined) {
    if (data.currentPassword !== undefined) {
      const isMatch = await comparePassword(
        data.currentPassword,
        user.password
      );
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
      }
    }
    updates.password = await hashPassword(data.password);
  }

  return updates;
};

const applyUpdate = async (
  user,
  data,
  { uploadedFilename, log: requestLog } = {}
) => {
  const log = requestLog || logger;
  const oldFilename = getProfileImageFilename(user.profileImage);

  try {
    const updates = await buildUpdatePayload(data, user);
    const transaction = await sequelize.transaction();

    try {
      await user.update(updates, { transaction });
      await transaction.commit();
      await user.reload();

      if (data.profileImage && oldFilename) {
        deleteProfileImageFile(oldFilename);
      }

      return sanitizeUser(user);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    if (uploadedFilename) {
      deleteProfileImageFile(uploadedFilename);
    }

    if (err instanceof AppError && err.statusCode === 401) {
      log.warn({ userId: user.id }, 'User update failed: incorrect current password');
    } else if (!(err instanceof AppError)) {
      log.warn({ userId: user.id, err: err.message }, 'User update failed');
    }

    throw err;
  }
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return sanitizeUser(user);
};

const listUsers = async ({ page, limit }) => {
  const { rows, count } = await User.findAndCountAll({
    order: [['createdAt', 'DESC']],
    ...getPaginationOptions({ page, limit }),
  });

  return {
    items: rows.map(sanitizeUser),
    total: count,
  };
};

const updateMe = async (userId, data, options = {}) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return applyUpdate(user, data, options);
};

const updateById = async (targetId, data, options = {}) => {
  const user = await User.findByPk(targetId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return applyUpdate(user, data, options);
};

module.exports = { sanitizeUser, getMe, listUsers, updateMe, updateById };
