module.exports = (sequelize, DataTypes) => {
  const EventBanner = sequelize.define(
    "EventBanner",
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
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: false,
        defaultValue: "image",
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "inactive",
      },
    },
    {
      tableName: "event_banners",
      timestamps: true,
      paranoid: true,
    }
  );

  EventBanner.associate = (models) => {
    EventBanner.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventBanner;
};
