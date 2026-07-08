const { User } = require('../models');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { deleteProfileImageFile } = require('../config/upload');

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

const register = async (data, { uploadedFilename } = {}) => {
  const hashedPassword = await hashPassword(data.password);

  try {
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      profileImage: data.profileImage ?? null,
      isActive: true,
    });

    return issueAuthResponse(user);
  } catch (err) {
    if (uploadedFilename) {
      deleteProfileImageFile(uploadedFilename);
    }
    throw err;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is inactive', 403);
  }

  return issueAuthResponse(user);
};

module.exports = { register, login };
