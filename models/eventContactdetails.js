module.exports = (sequelize, DataTypes) => {
  const EventContactDetails = sequelize.define(
    "EventContactDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "events",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Address is required",
          },
        },
      },

      mobile_numbers: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      emails: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      social_links: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "event_contact_details",
      timestamps: true,
      paranoid: true,
    },
  );

  EventContactDetails.associate = (models) => {
    EventContactDetails.belongsTo(models.Event, {
      foreignKey: "event_id",
      as: "event",
    });
  };

  return EventContactDetails;
};
