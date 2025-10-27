"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("experience_letter", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "system_users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      joining_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      relieving_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      employment_type: {
        type: Sequelize.ENUM("Full-Time", "Part-Time", "Intern", "Contract"),
        allowNull: false,
      },
      performance_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      issued_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("experience_letter");
  },
};
