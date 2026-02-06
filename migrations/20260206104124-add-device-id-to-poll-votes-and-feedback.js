"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /* ================================
       PROGRAM QUESTION VOTES
    ================================ */

    // 1️⃣ Add device_id column
    await queryInterface.addColumn("program_question_votes", "device_id", {
      type: Sequelize.STRING,
      allowNull: true, // temp true for existing rows
    });

    // 2️⃣ Remove OLD unique index (ip based)
    try {
      await queryInterface.removeIndex("program_question_votes", [
        "program_question_id",
        "ip_address",
      ]);
    } catch (e) {
      // index may not exist in some envs
    }

    // 3️⃣ Add NEW unique index (device based)
    await queryInterface.addIndex(
      "program_question_votes",
      ["program_question_id", "device_id"],
      {
        unique: true,
        name: "uniq_vote_per_device_per_question",
      },
    );

    /* ================================
       PROGRAM QUESTION FEEDBACKS
    ================================ */

    // 4️⃣ Add device_id column
    await queryInterface.addColumn("program_question_feedbacks", "device_id", {
      type: Sequelize.STRING,
      allowNull: true, // temp true for existing rows
    });

    // 5️⃣ Add unique index for feedback
    await queryInterface.addIndex(
      "program_question_feedbacks",
      ["program_question_id", "device_id"],
      {
        unique: true,
        name: "uniq_feedback_per_device_per_question",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    /* ================================
       PROGRAM QUESTION VOTES
    ================================ */

    await queryInterface.removeIndex(
      "program_question_votes",
      "uniq_vote_per_device_per_question",
    );

    await queryInterface.addIndex(
      "program_question_votes",
      ["program_question_id", "ip_address"],
      {
        unique: true,
        name: "uniq_vote_per_ip_per_question",
      },
    );

    await queryInterface.removeColumn("program_question_votes", "device_id");

    /* ================================
       PROGRAM QUESTION FEEDBACKS
    ================================ */

    await queryInterface.removeIndex(
      "program_question_feedbacks",
      "uniq_feedback_per_device_per_question",
    );

    await queryInterface.removeColumn(
      "program_question_feedbacks",
      "device_id",
    );
  },
};
