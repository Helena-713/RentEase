const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { PROPERTY_TYPES } = require('../constants/propertyType');
const { PROPERTY_STATUSES, PropertyStatus } = require('../constants/propertyStatus');

const Property = sequelize.define(
  'Property',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    landlordId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    propertyType: {
      type: DataTypes.ENUM(...PROPERTY_TYPES),
      allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    areaSqft: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...PROPERTY_STATUSES),
      allowNull: false,
      defaultValue: PropertyStatus.AVAILABLE,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'properties',
    underscored: true,
  }
);

Property.associate = (models) => {
  Property.belongsTo(models.User, {
    as: 'landlord',
    foreignKey: 'landlordId',
  });
  Property.hasMany(models.PropertyImage, {
    as: 'images',
    foreignKey: 'propertyId',
  });
  Property.belongsToMany(models.Amenity, {
    through: models.PropertyAmenity,
    foreignKey: 'propertyId',
    otherKey: 'amenityId',
    as: 'amenities',
  });
  Property.hasMany(models.Application, {
    as: 'applications',
    foreignKey: 'propertyId',
  });
  Property.hasMany(models.Review, {
    as: 'reviews',
    foreignKey: 'propertyId',
  });
};

module.exports = Property;
