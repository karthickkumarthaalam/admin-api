"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("payslip", "conversion_currency_id", {
      type: DataTypes.INTEGER,
      model: {
        references: "Currencies",
        key: "id",
      },
    });

    await queryInterface.addColumn("payslip", "converted_net_salary", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("payslip", "conversion_currency_id");
    await queryInterface.removeColumn("payslip", "converted_net_salary");
  },
};
