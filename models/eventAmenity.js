module.exports = (sequelize, DataTypes) => {
  const EventAmenity = sequelize.define(
    "EventAmenity",
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
          model: "Events",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "event_amenities",
      timestamps: true,
      paranoid: true,
    }
  );

  EventAmenity.associate = (models) => {
    EventAmenity.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventAmenity;
};
