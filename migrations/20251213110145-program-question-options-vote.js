"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /* ===============================
       1. program_questions
    =============================== */
    await queryInterface.createTable("program_questions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      radio_program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "RadioPrograms", // existing table
          key: "id",
        },
        onDelete: "CASCADE",
      },

      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      question_type: {
        type: Sequelize.ENUM("poll", "quiz"),
        allowNull: false,
        defaultValue: "poll",
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("active", "in-active"),
        defaultValue: "active",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    /* ===============================
       2. program_question_options
    =============================== */
    await queryInterface.createTable("program_question_options", {
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

      option_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      is_correct: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    /* ===============================
       3. program_question_votes
    =============================== */
    await queryInterface.createTable("program_question_votes", {
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

      program_question_option_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "program_question_options",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      user_agent: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    /* ===============================
       INDEXES
    =============================== */

    // Prevent duplicate voting per question per IP
    await queryInterface.addIndex(
      "program_question_votes",
      ["program_question_id", "ip_address"],
      {
        unique: true,
        name: "uq_program_question_ip",
      }
    );

    // Speed up result aggregation
    await queryInterface.addIndex(
      "program_question_votes",
      ["program_question_option_id"],
      {
        name: "idx_option_votes",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order (important!)
    await queryInterface.dropTable("program_question_votes");
    await queryInterface.dropTable("program_question_options");
    await queryInterface.dropTable("program_questions");

    // Cleanup ENUMs (important for Postgres / MySQL safety)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_program_questions_question_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_program_questions_status";'
    );
  },
};
