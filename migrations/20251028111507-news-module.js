"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ NewsCategory Table
    await queryInterface.createTable("news_category", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sub_categories: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    // 2️⃣ News Table
    await queryInterface.createTable("news", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subcategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      cover_image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      audio_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      published_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
        allowNull: false,
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
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    // 3️⃣ NewsMedia Table
    await queryInterface.createTable("news_media", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "news",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("image", "video"),
        defaultValue: "image",
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    // 4️⃣ NewsReactions Table
    await queryInterface.createTable("news_reactions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "news",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Members",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      guest_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reaction: {
        type: Sequelize.ENUM("like", "dislike"),
        defaultValue: "like",
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    // 5️⃣ NewsComments Table
    await queryInterface.createTable("news_comments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "news",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Members",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      guest_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guest_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guest_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("news_comments");
    await queryInterface.dropTable("news_reactions");
    await queryInterface.dropTable("news_media");
    await queryInterface.dropTable("news");
    await queryInterface.dropTable("news_category");
  },
};
