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
    await queryInterface.addColumn('Members', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Members', 'payment_method_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Members', 'auto_renew', {
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
    await queryInterface.removeColumn('Members', 'stripe_customer_id');
    await queryInterface.removeColumn('Members', 'payment_method_id');
    await queryInterface.removeColumn('Members', 'auto_renew');
  }
};
