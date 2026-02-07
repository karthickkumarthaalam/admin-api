"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("summer_festival_refund", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      ORDER_ID: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      NAME: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      EMAIL_ID: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      PHONE_NUMBER: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      REFUND_OR_CONTINUE: {
        type: Sequelize.ENUM("refund", "continue"),
        allowNull: false,
      },

      PAYMENT_MODE: {
        type: Sequelize.ENUM("twint", "bank", "card"),
        allowNull: true,
      },

      TWINT_ACCOUNT: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      BANK_NAME: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      IBAN_NUMBER: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      BIC_SWIFT_CODE: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      FULL_NAME: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      TICKET_DESCRIPTION: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      BILL_ATTACHMENT: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      REFUNDED_STATUS: {
        type: Sequelize.ENUM("pending", "verified", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },

      USER_IP: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      USER_CITY: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("summer_festival_refund");
  },
};
