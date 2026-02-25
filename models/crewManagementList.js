module.exports = (sequelize, DataTypes) => {
  const CrewManagementList = sequelize.define(
    "CrewManagementList",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      crew_management_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CrewManagement",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      given_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sur_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passport_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      date_of_issue: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      date_of_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      passport_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      visa_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      visa_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      visa_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      visa_issue: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      visa_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      food_preference: {
        type: DataTypes.ENUM(
          "veg",
          "non_veg",
          "vegan",
          "jain",
          "halal",
          "eggitarian",
          "custom",
        ),
        allowNull: true,
      },
      flight_class: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      room_preference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "in-active"),
        defaultValue: "in-active",
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "crew_management_list",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewManagementList.associate = (models) => {
    CrewManagementList.belongsTo(models.CrewManagement, {
      foreignKey: "crew_management_id",
      as: "crew",
    });
    CrewManagementList.hasMany(models.CrewFlights, {
      foreignKey: "crew_list_id",
      as: "flights",
    });
    CrewManagementList.hasMany(models.CrewRooms, {
      foreignKey: "crew_list_id",
      as: "rooms",
    });
  };

  return CrewManagementList;
};
