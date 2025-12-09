"use strict";

module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("podcast_creator", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      id_proof_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      id_proof_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reason_to_join: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      social_links: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
        allowNull: false,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "system_users",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Will be set after admin approves
      },
      reset_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_otp_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("podcast_creator");
  },
};
