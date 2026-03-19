"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("flash_news", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      news_content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: Sequelize.ENUM("active", "in-active"),
        defaultValue: "active",
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
    });

    await queryInterface.createTable("program_category_flash_news", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      program_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "program_category",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      flash_news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "flash_news",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
    });

    await queryInterface.addIndex("program_category_flash_news", [
      "program_category_id",
    ]);

    await queryInterface.addIndex("program_category_flash_news", [
      "flash_news_id",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("program_category_flash_news");
    await queryInterface.dropTable("flash_news");
  },
};
