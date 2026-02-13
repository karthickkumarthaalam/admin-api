module.exports = (sequelize, DataTypes) => {
  const EventEnquiry = sequelize.define(
    "EventEnquiry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "resolved", "closed"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "event_enquiries",
      timestamps: true,
      paranoid: true,
    },
  );

  EventEnquiry.associate = (models) => {
    EventEnquiry.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventEnquiry;
};
