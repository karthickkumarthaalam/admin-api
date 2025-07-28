"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("expenses", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // 2. payment_mode
    await queryInterface.addColumn("payment_mode", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // 3. paid_through
    await queryInterface.addColumn("paid_through", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // 4. merchants (assuming table name is lowercase plural)
    await queryInterface.addColumn("merchants", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("categories", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("expenses", "created_by");
    await queryInterface.removeColumn("payment_mode", "created_by");
    await queryInterface.removeColumn("paid_through", "created_by");
    await queryInterface.removeColumn("merchants", "created_by");
    await queryInterface.removeColumn("categories", "created_by");
  },
};
