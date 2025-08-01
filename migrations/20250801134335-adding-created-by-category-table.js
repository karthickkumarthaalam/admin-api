'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Categories");

    if (!table["created_by"]) {
      await queryInterface.addColumn("Categories", "created_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",  // ✅ correct reference
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Categories", "created_by");
  }
};
