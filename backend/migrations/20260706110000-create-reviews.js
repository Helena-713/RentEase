'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'reviews',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          reviewer_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          reviewee_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
          target_type: {
            type: Sequelize.ENUM('LANDLORD', 'TENANT'),
            allowNull: false,
          },
          rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          comment: {
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
        'reviews',
        ['reviewer_id', 'reviewee_id', 'property_id', 'target_type'],
        {
          unique: true,
          name: 'reviews_reviewer_reviewee_property_target_unique',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'reviews',
        ['reviewer_id'],
        {
          name: 'reviews_reviewer_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'reviews',
        ['reviewee_id'],
        {
          name: 'reviews_reviewee_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'reviews',
        ['property_id'],
        {
          name: 'reviews_property_id_idx',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_reviews_target_type";'
    );
  },
};
