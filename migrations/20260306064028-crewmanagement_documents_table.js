"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("crew_management_document", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      crew_management_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      document_type: {
        type: Sequelize.ENUM(
          "invitation_letter",
          "covering_letter",
          "crew_list",
          "flyer",
          "thaalam_profile",
          "hotel_itinerary",
          "switzerland_residence_id",
          "company_registration",
          "passport",
        ),
        allowNull: false,
      },

      file_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("crew_management_document");
  },
};
