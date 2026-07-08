const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PropertyImage = sequelize.define(
  'PropertyImage',
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
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'property_images',
    underscored: true,
    updatedAt: false,
  }
);

PropertyImage.associate = (models) => {
  PropertyImage.belongsTo(models.Property, {
    foreignKey: 'propertyId',
  });
};

module.exports = PropertyImage;
