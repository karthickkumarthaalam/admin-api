module.exports = (sequelize, DataTypes) => {
  const CrewRooms = sequelize.define(
    "CrewRooms",
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
      hotel_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      room_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      room_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      checkin_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      checkout_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      checkin_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      checkout_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      room_charge: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "crew_rooms",
      timestamps: true,
    },
  );

  CrewRooms.associate = (models) => {
    CrewRooms.belongsTo(models.CrewManagementList, {
      foreignKey: "crew_list_id",
      as: "crew",
    });
  };

  return CrewRooms;
};
