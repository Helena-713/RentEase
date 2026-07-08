const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { USER_ROLES } = require('../constants/userRoles');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...USER_ROLES),
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    underscored: true,
  }
);

User.associate = (models) => {
  User.hasOne(models.LandlordVerification, {
    foreignKey: 'userId',
  });
  User.hasMany(models.Property, {
    as: 'properties',
    foreignKey: 'landlordId',
  });
  User.hasMany(models.Application, {
    as: 'applications',
    foreignKey: 'tenantId',
  });
  User.hasMany(models.Review, {
    as: 'reviewsWritten',
    foreignKey: 'reviewerId',
  });
  User.hasMany(models.Review, {
    as: 'reviewsReceived',
    foreignKey: 'revieweeId',
  });
};

module.exports = User;
