module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "planning",
          "upcoming",
          "ongoing",
          "completed",
          "postponed",
          "cancelled",
        ),
        allowNull: false,
        defaultValue: "planning",
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "events",
      timestamps: true,
      paranoid: true,
    },
  );

  // 🔗 Associations
  Event.associate = (models) => {
    Event.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });

    Event.hasMany(models.EventCrewMember, {
      foreignKey: "event_id",
      as: "crew_members",
    });

    Event.hasMany(models.EventBanner, {
      foreignKey: "event_id",
      as: "banners",
    });

    Event.hasMany(models.EventAmenity, {
      foreignKey: "event_id",
      as: "amenities",
    });

    Event.hasMany(models.EventEnquiry, {
      foreignKey: "event_id",
      as: "enquiries",
    });

    Event.hasOne(models.EventContactDetails, {
      foreignKey: "event_id",
      as: "contacts",
    });
  };

  return Event;
};
