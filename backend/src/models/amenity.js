const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Amenity = sequelize.define(
  'Amenity',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'amenities',
    underscored: true,
  }
);

Amenity.associate = (models) => {
  Amenity.belongsToMany(models.Property, {
    through: models.PropertyAmenity,
    foreignKey: 'amenityId',
    otherKey: 'propertyId',
    as: 'properties',
  });
};

module.exports = Amenity;
