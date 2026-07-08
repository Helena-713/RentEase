const UserRole = {
  LAND_LORD: 'LAND_LORD',
  TENANT: 'TENANT',
  ADMIN: 'ADMIN',
};

const USER_ROLES = Object.values(UserRole);

const REGISTER_ROLES = [UserRole.LAND_LORD, UserRole.TENANT];

module.exports = { UserRole, USER_ROLES, REGISTER_ROLES };
