'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('Users', 'acl');
    await queryInterface.removeColumn('Users', 'role');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('Users', 'acl', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM("admin", "rj"),
      defaultValue: "admin",
    });
  }
};
