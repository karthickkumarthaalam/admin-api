module.exports = (sequelize, DataTypes) => {
  const Experience = sequelize.define(
    "Experience",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "system_users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      relieving_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      employment_type: {
        type: DataTypes.ENUM("Full-Time", "Part-Time", "Intern", "Contract"),
        allowNull: false,
      },
      performance_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      issued_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "experience_letter",
      timestamps: true,
      paranoid: true,
    }
  );

  Experience.associate = (models) => {
    Experience.belongsTo(models.SystemUsers, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Experience;
};
