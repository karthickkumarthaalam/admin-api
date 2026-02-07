"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attendees", {
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

      TICKET_ID: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      TICKET_CLASS: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      FIRST_NAME: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      EMAIL: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      MOBILE_NO: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      COUNTRY: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      AMOUNT_COLLECTED: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      PURCHASED_DATE: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ORDER_TIME: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      PAYMENT_MODE: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      PAYMENT_STATUS: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      PAYMENT_GATEWAY: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      GATEWAY_TRANSACTION_ID: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // ✅ Recommended indexes
    await queryInterface.addIndex("attendees", ["ORDER_ID"], {
      name: "idx_attendees_order_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("attendees");
  },
};
