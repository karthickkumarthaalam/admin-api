"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /* ==============================
       PODCAST ANALYTICS
    ============================== */
    await queryInterface.createTable("podcast_analytics", {
      podcast_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "podcasts",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      play_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      shares_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    });

    /* ==============================
       PODCAST VIEWS (DEDUP)
    ============================== */
    await queryInterface.createTable("podcast_views", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      podcast_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "podcasts",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      member_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      guest_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      viewed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Indexes for podcast_views
    await queryInterface.addIndex("podcast_views", ["podcast_id", "member_id"]);

    await queryInterface.addIndex("podcast_views", ["podcast_id", "guest_id"]);

    await queryInterface.addIndex("podcast_views", [
      "podcast_id",
      "ip_address",
    ]);

    /* ==============================
       PODCAST SHARES
    ============================== */
    await queryInterface.createTable("podcast_shares", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      podcast_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "podcasts",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      member_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      guest_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      platform: {
        type: Sequelize.ENUM(
          "whatsapp",
          "facebook",
          "twitter",
          "instagram",
          "copy_link",
          "other",
        ),
        allowNull: false,
      },

      shared_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Indexes for podcast_shares
    await queryInterface.addIndex("podcast_shares", [
      "podcast_id",
      "member_id",
      "platform",
    ]);

    await queryInterface.addIndex("podcast_shares", [
      "podcast_id",
      "guest_id",
      "platform",
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("podcast_shares");
    await queryInterface.dropTable("podcast_views");
    await queryInterface.dropTable("podcast_analytics");
  },
};
