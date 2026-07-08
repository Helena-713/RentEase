'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'conversations',
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
          last_message_at: {
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
        'conversations',
        ['property_id', 'tenant_id', 'landlord_id'],
        {
          unique: true,
          name: 'conversations_property_tenant_landlord_unique',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'conversations',
        ['tenant_id'],
        {
          name: 'conversations_tenant_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'conversations',
        ['landlord_id'],
        {
          name: 'conversations_landlord_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'conversations',
        ['last_message_at'],
        {
          name: 'conversations_last_message_at_idx',
          transaction,
        }
      );

      await queryInterface.createTable(
        'messages',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          conversation_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'conversations',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          sender_id: {
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
            allowNull: false,
          },
          is_read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
          },
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'messages',
        ['conversation_id'],
        {
          name: 'messages_conversation_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'messages',
        ['sender_id'],
        {
          name: 'messages_sender_id_idx',
          transaction,
        }
      );

      await queryInterface.addIndex(
        'messages',
        ['created_at'],
        {
          name: 'messages_created_at_idx',
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
  },
};
