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
    await queryInterface.addColumn("Budgets", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn("Budgets", "is_deleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn("expenses", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("expenses", "is_deleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("Budgets", "deleted_at");
    await queryInterface.removeColumn("Budgets", "is_deleted");
    await queryInterface.removeColumn("expenses", "deleted_at");
    await queryInterface.removeColumn("expenses", "is_deleted");
  }
};
