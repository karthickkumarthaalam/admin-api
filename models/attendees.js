module.exports = (sequelize, DataTypes) => {
  const Attendee = sequelize.define(
    "Attendee",
    {
      ORDER_ID: {
        type: DataTypes.STRING,
      },
      TICKET_ID: {
        type: DataTypes.STRING,
      },
      TICKET_CLASS: {
        type: DataTypes.STRING,
      },
      FIRST_NAME: {
        type: DataTypes.STRING,
      },
      EMAIL: {
        type: DataTypes.STRING,
      },
      MOBILE_NO: {
        type: DataTypes.STRING,
      },
      COUNTRY: {
        type: DataTypes.STRING,
      },
      AMOUNT_COLLECTED: {
        type: DataTypes.FLOAT,
      },
      PURCHASED_DATE: {
        type: DataTypes.STRING,
      },
      ORDER_TIME: {
        type: DataTypes.STRING,
      },
      PAYMENT_MODE: {
        type: DataTypes.STRING,
      },
      PAYMENT_STATUS: {
        type: DataTypes.STRING,
      },
      PAYMENT_GATEWAY: {
        type: DataTypes.STRING,
      },
      GATEWAY_TRANSACTION_ID: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "attendees",
      timestamps: false,
    },
  );

  return Attendee;
};
