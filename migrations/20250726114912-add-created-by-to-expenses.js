"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // expenses
    const expenses = await queryInterface.describeTable("expenses");
    if (!expenses["created_by"]) {
      await queryInterface.addColumn("expenses", "created_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      });
    }

    // payment_mode
    const paymentMode = await queryInterface.describeTable("payment_mode");
    if (!paymentMode["created_by"]) {
      await queryInterface.addColumn("payment_mode", "created_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      });
    }

    // paid_through
    const paidThrough = await queryInterface.describeTable("paid_through");
    if (!paidThrough["created_by"]) {
      await queryInterface.addColumn("paid_through", "created_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      });
    }

    // merchants
    const merchants = await queryInterface.describeTable("merchants");
    if (!merchants["created_by"]) {
      await queryInterface.addColumn("merchants", "created_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      });
    }

  },

  async down(queryInterface) {
    // Reverse in same order with existence check
    const tables = [
      "expenses",
      "payment_mode",
      "paid_through",
      "merchants",
    ];

    for (const table of tables) {
      const columns = await queryInterface.describeTable(table);
      if (columns["created_by"]) {
        await queryInterface.removeColumn(table, "created_by");
      }
    }
  },
};
