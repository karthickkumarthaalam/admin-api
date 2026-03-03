"use strict";

const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      "crew_manage_permissions",
      "can_manage_visa",
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );

    await queryInterface.addColumn("crew_flights", "flight_class", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn("crew_flights", "ticket_number");

    await queryInterface.removeColumn("crew_flights", "ticket_issued_date");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn(
      "crew_manage_permissions",
      "can_manage_visa",
    );

    await queryInterface.removeColumn("crew_flights", "flight_class");

    await queryInterface.addColumn("crew_flights", "ticket_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_flights", "ticket_issued_date", {
      type: sequelize.DATE,
      allowNull: true,
    });
  },
};
