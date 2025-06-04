'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Members", "address1", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Members", "address2", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Members", "address1");
    await queryInterface.removeColumn("Members", "address2");
  }
};
