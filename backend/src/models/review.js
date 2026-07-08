const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { REVIEW_TARGET_TYPES } = require('../constants/reviewTargetType');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    revieweeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    targetType: {
      type: DataTypes.ENUM(...REVIEW_TARGET_TYPES),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    underscored: true,
  }
);

Review.associate = (models) => {
  Review.belongsTo(models.User, {
    as: 'reviewer',
    foreignKey: 'reviewerId',
  });
  Review.belongsTo(models.User, {
    as: 'reviewee',
    foreignKey: 'revieweeId',
  });
  Review.belongsTo(models.Property, {
    as: 'property',
    foreignKey: 'propertyId',
  });
  Review.belongsTo(models.Application, {
    as: 'application',
    foreignKey: 'applicationId',
  });
};

module.exports = Review;
