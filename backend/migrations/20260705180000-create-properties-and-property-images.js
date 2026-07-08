'use strict';

const { PROPERTY_TYPES } = require('../src/constants/propertyType');
const { PROPERTY_STATUSES, PropertyStatus } = require('../src/constants/propertyStatus');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'properties',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          landlord_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          address: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          city: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          state: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          price: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
          },
          property_type: {
            type: Sequelize.ENUM(...PROPERTY_TYPES),
            allowNull: false,
          },
          bedrooms: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          bathrooms: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          area_sqft: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM(...PROPERTY_STATUSES),
            allowNull: false,
            defaultValue: PropertyStatus.AVAILABLE,
          },
          is_approved: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          rejection_reason: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'properties',
        ['landlord_id'],
        {
          name: 'properties_landlord_id_idx',
          transaction,
        }
      );

      await queryInterface.createTable(
        'property_images',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          property_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'properties',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          image_url: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          is_cover: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          display_order: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'property_images',
        ['property_id'],
        {
          name: 'property_images_property_id_idx',
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX property_images_one_cover_per_property
         ON property_images (property_id)
         WHERE is_cover = true`,
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('property_images');
    await queryInterface.dropTable('properties');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_properties_property_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_properties_status";'
    );
  },
};
