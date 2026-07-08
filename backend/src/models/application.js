const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const {
  APPLICATION_STATUSES,
  ApplicationStatus,
} = require('../constants/applicationStatus');

const Application = sequelize.define(
  'Application',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...APPLICATION_STATUSES),
      allowNull: false,
      defaultValue: ApplicationStatus.PENDING,
    },
  },
  {
    tableName: 'applications',
    underscored: true,
  }
);

Application.associate = (models) => {
  Application.belongsTo(models.Property, {
    as: 'property',
    foreignKey: 'propertyId',
  });
  Application.belongsTo(models.User, {
    as: 'tenant',
    foreignKey: 'tenantId',
  });
};

module.exports = Application;
