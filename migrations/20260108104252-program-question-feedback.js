"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("program_question_feedbacks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      answer_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      // paranoid soft delete
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addColumn("program_question_votes", "country", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("program_question_votes", "country_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex("program_question_votes", ["country"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("program_question_feedbacks");
    await queryInterface.removeIndex("program_question_votes", ["country"]);
    await queryInterface.removeColumn("program_question_votes", "country_name");
    await queryInterface.removeColumn("program_question_votes", "country");
  },
};
