'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const systemUsers = await queryInterface.describeTable('system_users');
    const users = await queryInterface.describeTable('Users');

    if (!systemUsers['is_admin']) {
      await queryInterface.addColumn('system_users', 'is_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!users['role']) {
      await queryInterface.addColumn('Users', 'role', {
        type: Sequelize.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const systemUsers = await queryInterface.describeTable('system_users');
    const users = await queryInterface.describeTable('Users');

    if (systemUsers['is_admin']) {
      await queryInterface.removeColumn('system_users', 'is_admin');
    }

    if (users['role']) {
      await queryInterface.removeColumn('Users', 'role');
      // Drop ENUM type manually (MySQL will ignore this if ENUM is dropped automatically)
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Users_role;');
    }
  }
};
