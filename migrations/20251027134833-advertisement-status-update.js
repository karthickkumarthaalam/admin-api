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
    await queryInterface.changeColumn("Advertisements", "status", {
      type: Sequelize.ENUM("pending", "intimated", "in-progress", "closed"),
      defaultValue: "pending",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("Advertisements", "status", {
      type: Sequelize.ENUM("pending", "resolved", "closed"),
      defaultValue: "pending",
      allowNull: false,
    });
  },
};
