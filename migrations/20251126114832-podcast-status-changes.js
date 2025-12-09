"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Convert ENUM → VARCHAR
    await queryInterface.sequelize.query(`
      ALTER TABLE podcasts MODIFY status VARCHAR(20);
    `);

    // 2️⃣ Fix old data
    await queryInterface.sequelize.query(`
      UPDATE podcasts 
      SET status = CASE
        WHEN status = 'active' THEN 'approved'
        WHEN status = 'inactive' THEN 'pending'
        ELSE 'pending'
      END;
    `);

    // 3️⃣ Convert back to ENUM safely
    await queryInterface.changeColumn("podcasts", "status", {
      type: Sequelize.ENUM("approved", "pending", "reviewing"),
      defaultValue: "pending",
      allowNull: false,
    });

    await queryInterface.addColumn("podcasts", "status_updated_by", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("podcasts", "status_updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("podcasts", "video_link", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("podcasts", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("podcasts", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1️⃣ Convert ENUM → VARCHAR again
    await queryInterface.sequelize.query(`
      ALTER TABLE podcasts MODIFY status VARCHAR(20);
    `);

    // 2️⃣ Restore previous values
    await queryInterface.sequelize.query(`
      UPDATE podcasts 
      SET status = CASE
        WHEN status = 'approved' THEN 'active'
        WHEN status = 'pending' THEN 'inactive'
        ELSE 'inactive'
      END;
    `);

    // 3️⃣ Restore original ENUM
    await queryInterface.changeColumn("podcasts", "status", {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    });

    // 4️⃣ Remove audit columns only if they exist
    await queryInterface.sequelize.query(`
      ALTER TABLE podcasts DROP COLUMN IF EXISTS status_updated_by;
      ALTER TABLE podcasts DROP COLUMN IF EXISTS status_updated_at;
      ALTER TABLE podcasts DROP COLUMN IF EXISTS video_link;
      ALTER TABLE podcasts DROP COLUMN IF EXISTS deletedAt;
      ALTER TABLE podcasts DROP COLUMN IF EXISTS slug;
    `);
  },
};
