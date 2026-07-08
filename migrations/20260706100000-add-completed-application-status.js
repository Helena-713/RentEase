'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_applications_status" ADD VALUE IF NOT EXISTS 'COMPLETED';`
    );
  },

  async down() {
    // PostgreSQL does not support removing enum values safely.
  },
};
