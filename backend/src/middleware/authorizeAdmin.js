const AppError = require('../utils/AppError');
const { UserRole } = require('../constants/userRoles');

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return next(new AppError('Forbidden', 403));
  }
  next();
};

module.exports = authorizeAdmin;
