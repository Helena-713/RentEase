'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'amenities',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
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
        'amenities',
        ['name'],
        {
          unique: true,
          name: 'amenities_name_unique',
          transaction,
        }
      );

      await queryInterface.createTable(
        'property_amenities',
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
          amenity_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'amenities',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'property_amenities',
        ['property_id', 'amenity_id'],
        {
          unique: true,
          name: 'property_amenities_property_id_amenity_id_unique',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'property_amenities',
        ['amenity_id'],
        {
          name: 'property_amenities_amenity_id_idx',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('property_amenities');
    await queryInterface.dropTable('amenities');
  },
};
