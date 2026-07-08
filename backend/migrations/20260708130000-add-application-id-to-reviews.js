'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'reviews',
        'application_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'applications',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      // Best-effort backfill: associate each review with the latest completed
      // application for the same property + tenant.
      //
      // - target_type='LANDLORD' => tenant is the reviewer
      // - target_type='TENANT'   => tenant is the reviewee
      await queryInterface.sequelize.query(
        `
        UPDATE reviews r
        SET application_id = (
          SELECT ap.id
          FROM applications ap
          WHERE ap.property_id = r.property_id
            AND ap.status = 'COMPLETED'
            AND ap.tenant_id = (
              CASE
                WHEN r.target_type = 'LANDLORD' THEN r.reviewer_id
                ELSE r.reviewee_id
              END
            )
          ORDER BY ap.updated_at DESC, ap.created_at DESC
          LIMIT 1
        )
        WHERE r.application_id IS NULL;
        `,
        { transaction }
      );

      // Replace the old uniqueness rule (per property) with per-rental-cycle uniqueness.
      await queryInterface.removeIndex(
        'reviews',
        'reviews_reviewer_reviewee_property_target_unique',
        { transaction }
      );

      await queryInterface.addIndex(
        'reviews',
        ['application_id', 'reviewer_id', 'target_type'],
        {
          unique: true,
          name: 'reviews_application_reviewer_target_unique',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        'reviews',
        'reviews_application_reviewer_target_unique',
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

      await queryInterface.removeColumn('reviews', 'application_id', {
        transaction,
      });
    });
  },
};

