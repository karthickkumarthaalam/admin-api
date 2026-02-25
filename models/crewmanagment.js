module.exports = (sequelize, DataTypes) => {
  const CrewManagement = sequelize.define(
    "CrewManagement",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      crew_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      tableName: "crew_management",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewManagement.associate = (models) => {
    CrewManagement.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
    CrewManagement.hasMany(models.CrewManagementList, {
      foreignKey: "crew_management_id",
      as: "crew_members",
    });
  };

  return CrewManagement;
};
