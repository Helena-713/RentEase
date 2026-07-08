'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const { USER_ROLES, UserRole } = require('../src/constants/userRoles');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'users',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          first_name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          last_name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
          },
          password: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          phone: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          role: {
            type: Sequelize.ENUM(...USER_ROLES),
            allowNull: false,
          },
          profile_image: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        'users',
        ['email'],
        {
          unique: true,
          name: 'users_email_unique',
          transaction,
        }
      );

      const hashedPassword = await bcrypt.hash('admin_password', 10);

      await queryInterface.bulkInsert(
        'users',
        [
          {
            id: randomUUID(),
            first_name: 'System',
            last_name: 'Administrator',
            email: 'admin@rentease.com',
            password: hashedPassword,
            phone: '+10000000000',
            role: UserRole.ADMIN,
            profile_image: null,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
