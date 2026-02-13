"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("event_contact_details", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mobile_numbers: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      emails: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      social_links: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("event_contact_details");
  },
};
