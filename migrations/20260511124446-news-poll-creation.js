"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─────────────────────────────────────
    // Polls Table
    // ─────────────────────────────────────
    await queryInterface.createTable("polls", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      allow_multiple: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      total_votes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ─────────────────────────────────────
    // Poll Options Table
    // ─────────────────────────────────────
    await queryInterface.createTable("poll_options", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "polls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      option_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      vote_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ─────────────────────────────────────
    // Poll Votes Table
    // ─────────────────────────────────────
    await queryInterface.createTable("poll_vote", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "polls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      option_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "poll_options",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      voted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // ─────────────────────────────────────
    // Indexes
    // ─────────────────────────────────────

    await queryInterface.addIndex("poll_options", ["poll_id"]);

    await queryInterface.addIndex("poll_vote", ["poll_id"]);

    await queryInterface.addIndex("poll_vote", ["option_id"]);

    await queryInterface.addIndex("poll_vote", ["ip_address"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("poll_vote");

    await queryInterface.dropTable("poll_options");

    await queryInterface.dropTable("polls");
  },
};
