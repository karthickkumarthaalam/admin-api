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
    await queryInterface.addColumn('members', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('members', 'payment_method_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('members', 'auto_renew', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('members', 'stripe_customer_id');
    await queryInterface.removeColumn('members', 'payment_method_id');
    await queryInterface.removeColumn('members', 'auto_renew');
  }
};
