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
    await queryInterface.addColumn("podcast_category", "created_by_type", {
      type: Sequelize.ENUM("system", "creator"),
      defaultValue: "system",
      allowNull: false,
    });

    await queryInterface.addColumn("podcast_category", "system_user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("podcast_category", "podcast_creator_id", {
      type: Sequelize.INTEGER,
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

    await queryInterface.removeColumn("podcast_category", "created_by_type");
    await queryInterface.removeColumn("podcast_category", "system_user_id");
    await queryInterface.removeColumn("podcast_category", "podcast_creator_id");
  },
};
