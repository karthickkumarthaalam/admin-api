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
    await queryInterface.addColumn("system_users", "employee_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("system_users", "bank_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("system_users", "ifsc_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("system_users", "account_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("system_users", "pan_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("system_users", "uan_number", {
      type: Sequelize.STRING,
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
    await queryInterface.removeColumn("system_users", "employee_id");
    await queryInterface.removeColumn("system_users", "bank_name");
    await queryInterface.removeColumn("system_users", "ifsc_code");
    await queryInterface.removeColumn("system_users", "account_number");
    await queryInterface.removeColumn("system_users", "pan_number");
    await queryInterface.removeColumn("system_users", "uan_number");
  },
};
