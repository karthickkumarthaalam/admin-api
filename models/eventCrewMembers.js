module.exports = (sequelize, DataTypes) => {
  const EventCrewMember = sequelize.define(
    "EventCrewMember",
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
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      social_links: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const raw = this.getDataValue("social_links");
          return raw ? raw.split("|||") : [];
        },
        set(value) {
          this.setDataValue(
            "social_links",
            Array.isArray(value) ? value.join("|||") : value
          );
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "inactive",
      },
    },
    {
      tableName: "event_crew_members",
      timestamps: true,
      paranoid: true,
    }
  );

  EventCrewMember.associate = (models) => {
    EventCrewMember.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventCrewMember;
};
