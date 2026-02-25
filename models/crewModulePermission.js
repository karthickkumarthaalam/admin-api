module.exports = (sequelize, DataTypes) => {
  const CrewModulePermission = sequelize.define(
    "CrewModulePermission",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      crew_management_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      system_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      can_manage_flight: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_manage_rooms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "crew_manage_permissions",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewModulePermission.associate = (models) => {
    CrewModulePermission.belongsTo(models.CrewManagement, {
      foreignKey: "crew_management_id",
      as: "crew",
    });

    CrewModulePermission.belongsTo(models.SystemUsers, {
      foreignKey: "system_user_id",
      as: "user",
    });
  };

  return CrewModulePermission;
};
