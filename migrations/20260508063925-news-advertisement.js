"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("news_advertisement", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      image_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      tag: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      headline: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      sub: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      cta: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      redirect_link: {
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

      size: {
        type: Sequelize.ENUM("big", "small"),
        defaultValue: "small",
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

      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("news_advertisement");
  },
};
