'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'applications',
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
          tenant_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          message: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM(
              'PENDING',
              'APPROVED',
              'REJECTED',
              'WITHDRAWN',
              'CANCELLED'
            ),
            allowNull: false,
            defaultValue: 'PENDING',
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
        'applications',
        ['property_id'],
        {
          name: 'applications_property_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'applications',
        ['tenant_id'],
        {
          name: 'applications_tenant_id_idx',
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX applications_one_pending_per_tenant_property
         ON applications (property_id, tenant_id)
         WHERE status = 'PENDING'`,
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_applications_status";'
    );
  },
};
