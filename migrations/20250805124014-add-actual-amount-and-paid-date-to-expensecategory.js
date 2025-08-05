'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("expense_categories", "actual_amount", {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn("expense_categories", "paid_date", {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("expense_categories", "actual_amount");
    await queryInterface.removeColumn("expense_categories", "paid_date");
  }
};
