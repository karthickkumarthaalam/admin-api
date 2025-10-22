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
    await queryInterface.changeColumn("podcast_comments", "member_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("podcast_comments", "guest_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("podcast_comments", "guest_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("podcast_comments", "guest_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("payslip", "payment_mode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("podcast_comments", "guest_id");
    await queryInterface.removeColumn("podcast_comments", "guest_name");
    await queryInterface.removeColumn("podcast_comments", "guest_email");
    await queryInterface.removeColumn("payslip", "payment_mode");
  },
};
