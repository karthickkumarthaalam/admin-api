module.exports = (sequelize, DataTypes) => {
  const CrewFlights = sequelize.define(
    "CrewFlights",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      crew_list_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      from_city: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      to_city: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      flight_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      airline: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      departure_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      arrival_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      terminal: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ticket_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      pnr: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ticket_file: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ticket_issued_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      booking_status: {
        type: DataTypes.ENUM("pending", "booked", "cancelled"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "crew_flights",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewFlights.associate = (models) => {
    CrewFlights.belongsTo(models.CrewManagementList, {
      foreignKey: "crew_list_id",
      as: "crew",
    });
  };

  return CrewFlights;
};
