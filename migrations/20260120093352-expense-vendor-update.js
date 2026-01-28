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
    await queryInterface.changeColumn("expenses", "vendor_type", {
      type: Sequelize.ENUM("vendor", "user", "creator"),
      allowNull: true,
      defaultValue: "vendor",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("expenses", "vendor_type", {
      type: Sequelize.ENUM("vendor", "user"),
      allowNull: true,
      defaultValue: "vendor",
    });
  },
};
