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
    await queryInterface.addColumn("events", "ticketing_type", {
      type: Sequelize.ENUM("internal", "external"),
      allowNull: false,
      defaultValue: "internal",
    });
    await queryInterface.addColumn("events", "ticket_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("events", "ticket_embed_code", {
      type: Sequelize.TEXT,
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

    await queryInterface.removeColumn("events", "ticketing_type");
    await queryInterface.removeColumn("events", "ticket_url");
    await queryInterface.removeColumn("events", "ticket_embed_code");
  },
};
