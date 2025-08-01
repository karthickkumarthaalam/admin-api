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
    await queryInterface.addColumn("Agreements", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE"
    });

    await queryInterface.addColumn("podcasts", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE"
    });

    await queryInterface.addColumn("Categories", "created_by", {
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Agreements", "created_by");
    await queryInterface.removeColumn("podcasts", "created_by");
    await queryInterface.removeColumn("Categories", "created_by");
  }
};
