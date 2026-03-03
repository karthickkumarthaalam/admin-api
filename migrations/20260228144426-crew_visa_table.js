"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("crew_visas", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      crew_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      visa_type: {
        type: Sequelize.ENUM("tourist", "business", "work", "student"),
        allowNull: false,
      },

      visa_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      date_of_issue: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      date_of_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      visa_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      visa_file_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      visa_file_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("crew_visas");
  },
};
