const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PropertyAmenity = sequelize.define(
  'PropertyAmenity',
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
    amenityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'property_amenities',
    underscored: true,
    timestamps: false,
  }
);

PropertyAmenity.associate = (models) => {
  PropertyAmenity.belongsTo(models.Property, {
    foreignKey: 'propertyId',
  });
  PropertyAmenity.belongsTo(models.Amenity, {
    foreignKey: 'amenityId',
  });
};

module.exports = PropertyAmenity;
