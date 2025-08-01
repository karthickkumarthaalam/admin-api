'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const agreements = await queryInterface.describeTable('Agreements');
    const podcasts = await queryInterface.describeTable('podcasts');
    const categories = await queryInterface.describeTable('Categories');

    if (!agreements['created_by']) {
      await queryInterface.addColumn('Agreements', 'created_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }

    if (!podcasts['created_by']) {
      await queryInterface.addColumn('podcasts', 'created_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }

    if (!categories['created_by']) {
      await queryInterface.addColumn('Categories', 'created_by', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Agreements', 'created_by');
    await queryInterface.removeColumn('podcasts', 'created_by');
    await queryInterface.removeColumn('Categories', 'created_by');
  }
};
