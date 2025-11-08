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
    await queryInterface.addColumn("event_banners", "status", {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "inactive",
    });
    await queryInterface.changeColumn("events", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("event_banners", "status");
    await queryInterface.changeColumn("events", "description", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
