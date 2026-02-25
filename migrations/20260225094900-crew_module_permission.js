"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable("crew_manage_permissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      crew_management_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management", // table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      system_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "system_users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      can_manage_flight: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      can_manage_rooms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("crew_manage_permissions");
  },
};
