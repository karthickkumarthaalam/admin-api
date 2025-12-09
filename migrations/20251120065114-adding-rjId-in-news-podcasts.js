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
    await queryInterface.addColumn("podcasts", "rj_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "system_users",
        key: "id",
      },
      onDelete: "SET NULL",
      after: "rjname",
    });

    await queryInterface.sequelize.query(
      `UPDATE podcasts p
      JOIN system_users s ON s.name = p.rjname
      SET p.rj_id = s.id
      WHERE p.rj_id IS NULL;`
    );

    await queryInterface.addColumn("news", "rj_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "system_users",
        key: "id",
      },
      onDelete: "SET NULL",
      after: "published_by",
    });

    await queryInterface.sequelize.query(`
      UPDATE news n
      JOIN system_users s ON s.name = n.published_by
      SET n.rj_id = s.id
      WHERE n.rj_id IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("podcasts", "rj_id");
    await queryInterface.removeColumn("news", "rj_id");
  },
};
