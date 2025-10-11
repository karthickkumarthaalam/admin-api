"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("expense_bill", "currency_id", {
      type: Sequelize.INTEGER,
      references: {
        model: "Currencies",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("expense_bill", "amount", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("expense_bill", "currency_id");
    await queryInterface.removeColumn("expense_bill", "amount");
  },
};
