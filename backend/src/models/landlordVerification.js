const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { VERIFICATION_STATUSES, VerificationStatus } = require('../constants/verificationStatus');

const LandlordVerification = sequelize.define(
  'LandlordVerification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...VERIFICATION_STATUSES),
      allowNull: false,
      defaultValue: VerificationStatus.PENDING,
    },
    verificationDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'landlord_verifications',
    underscored: true,
  }
);

LandlordVerification.associate = (models) => {
  LandlordVerification.belongsTo(models.User, {
    as: 'user',
    foreignKey: 'userId',
  });
  LandlordVerification.belongsTo(models.User, {
    as: 'verifier',
    foreignKey: 'verifiedBy',
  });
};

module.exports = LandlordVerification;
