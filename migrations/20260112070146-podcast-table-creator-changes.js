"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("podcasts", "created_by_type", {
      type: Sequelize.ENUM("system", "creator"),
      allowNull: false,
      defaultValue: "system",
    });

    await queryInterface.addColumn("podcasts", "system_user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "system_users",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("podcasts", "podcast_creator_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "podcast_creator",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.changeColumn("podcasts", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("podcasts", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.removeColumn("podcasts", "podcast_creator_id");
    await queryInterface.removeColumn("podcasts", "system_user_id");
    await queryInterface.removeColumn("podcasts", "created_by_type");

    // Drop ENUM if PG/MySQL supports cleanup (optional safety)
    if (queryInterface.sequelize.options.dialect === "mysql") {
      await queryInterface.sequelize.query(
        "ALTER TABLE podcasts MODIFY created_by_type ENUM('system');"
      );
    }
  },
};
