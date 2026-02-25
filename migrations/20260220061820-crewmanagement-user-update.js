"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("crew_management", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management", "otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management", "otp_expiry", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_management", "is_active", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("crew_management", "email");
    await queryInterface.removeColumn("crew_management", "password");
    await queryInterface.removeColumn("crew_management", "otp");
    await queryInterface.removeColumn("crew_management", "otp_expiry");
    await queryInterface.removeColumn("crew_management", "is_active");
  },
};
