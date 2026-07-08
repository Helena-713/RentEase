'use strict';

const {
  VERIFICATION_STATUSES,
  VerificationStatus,
} = require('../src/constants/verificationStatus');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'landlord_verifications',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          status: {
            type: Sequelize.ENUM(...VERIFICATION_STATUSES),
            allowNull: false,
            defaultValue: VerificationStatus.PENDING,
          },
          verification_document: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          rejection_reason: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          verified_by: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          verified_at: {
            type: Sequelize.DATE,
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
        'landlord_verifications',
        ['user_id'],
        {
          unique: true,
          name: 'landlord_verifications_user_id_unique',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'landlord_verifications',
        ['verified_by'],
        {
          name: 'landlord_verifications_verified_by_idx',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('landlord_verifications');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_landlord_verifications_status";'
    );
  },
};
