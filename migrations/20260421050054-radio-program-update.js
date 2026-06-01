"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("program_questions", "radio_program_id");
    await queryInterface.createTable("radio_program_question", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      program_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "program_questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      radio_program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "RadioPrograms",
          key: "id",
        },
        onDelete: "CASCADE",
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("program_questions", "radio_program_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "RadioPrograms",
        key: "id",
      },
      onDelete: "CASCADE",
    });
    await queryInterface.dropTable("radio_program_question");
  },
};
