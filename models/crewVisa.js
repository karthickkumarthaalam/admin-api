module.exports = (sequelize, DataTypes) => {
  const CrewVisa = sequelize.define(
    "CrewVisa",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      crew_list_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      visa_type: {
        type: DataTypes.ENUM("tourist", "business", "work", "student"),
        allowNull: false,
      },
      visa_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_issue: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      date_of_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      visa_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      visa_file_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      visa_file_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "crew_visas",
      timestamps: true,
    },
  );

  CrewVisa.associate = (models) => {
    CrewVisa.belongsTo(models.CrewManagementList, {
      foreignKey: "crew_list_id",
      as: "visas",
    });
  };

  return CrewVisa;
};
