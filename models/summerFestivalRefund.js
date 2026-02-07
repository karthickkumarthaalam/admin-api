// models/RefundEnquiry.js
module.exports = (sequelize, DataTypes) => {
  const SummerFestivalRefund = sequelize.define(
    "SummerFestivalRefund",
    {
      ORDER_ID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      NAME: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      EMAIL_ID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      PHONE_NUMBER: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      REFUND_OR_CONTINUE: {
        type: DataTypes.ENUM("refund", "continue"),
        allowNull: false,
      },
      PAYMENT_MODE: {
        type: DataTypes.ENUM("twint", "bank", "card"),
        allowNull: true,
      },
      TWINT_ACCOUNT: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      BANK_NAME: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IBAN_NUMBER: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      BIC_SWIFT_CODE: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      FULL_NAME: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      TICKET_DESCRIPTION: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      BILL_ATTACHMENT: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      REFUNDED_STATUS: {
        type: DataTypes.ENUM("pending", "verified", "refunded"),
        defaultValue: "pending",
        allowNull: false,
      },
      USER_IP: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      USER_CITY: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "summer_festival_refund",
      timestamps: true,
    },
  );

  return SummerFestivalRefund;
};
