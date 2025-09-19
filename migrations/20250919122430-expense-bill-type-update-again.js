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
    await queryInterface.changeColumn("expense_bill", "type", {
      type: Sequelize.ENUM("income", "expense", "payable", "others"),
      defaultValue: "expense",
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
    await queryInterface.changeColumn("expense_bill", "type", {
      type: Sequelize.ENUM("income", "expense", "payable"),
      defaultValue: null,
      allowNull: false,
    });
  },
};
