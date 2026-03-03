"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("crew_management_list", "visa_verified");
    await queryInterface.removeColumn("crew_management_list", "visa_number");
    await queryInterface.removeColumn("crew_management_list", "visa_issue");
    await queryInterface.removeColumn("crew_management_list", "visa_expiry");
    await queryInterface.removeColumn("crew_management_list", "visa_type");

    await queryInterface.addColumn("crew_management_list", "boarding_from", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management_list", "returning_to", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // remove newly added columns
    await queryInterface.removeColumn("crew_management_list", "boarding_from");
    await queryInterface.removeColumn("crew_management_list", "returning_to");

    await queryInterface.addColumn("crew_management_list", "visa_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // re-add removed columns
    await queryInterface.addColumn("crew_management_list", "visa_verified", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management_list", "visa_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management_list", "visa_issue", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management_list", "visa_expiry", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
