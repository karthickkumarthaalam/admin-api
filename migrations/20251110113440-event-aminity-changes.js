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
    await queryInterface.addColumn("event_amenities", "image", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("event_amenities", "status", {
      type: Sequelize.ENUM("inactive", "active"),
      allowNull: false,
      defaultValue: "inactive",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("event_amenities", "image");
    await queryInterface.removeColumn("event_amenities", "status");
  },
};
