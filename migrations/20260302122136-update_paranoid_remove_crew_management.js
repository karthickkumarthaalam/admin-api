"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // remove deletedAt columns
    await queryInterface.removeColumn("crew_management_list", "deletedAt");
    await queryInterface.removeColumn("crew_documents", "deletedAt");
    await queryInterface.removeColumn("crew_visas", "deletedAt");
    await queryInterface.removeColumn("crew_flights", "deletedAt");
    await queryInterface.removeColumn("crew_rooms", "deletedAt");
  },

  async down(queryInterface, Sequelize) {
    // add back deletedAt columns (for rollback)
    await queryInterface.addColumn("crew_management_list", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_documents", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_visas", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_flights", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("crew_rooms", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
