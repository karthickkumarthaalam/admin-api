// models/PreviousEmployment.js
module.exports = (sequelize, DataTypes) => {
  const PreviousEmployment = sequelize.define(
    "PreviousEmployment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      system_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "system_users", key: "id" },
        onDelete: "CASCADE",
      },
      company_name: { type: DataTypes.STRING, allowNull: false },
      designation: { type: DataTypes.STRING, allowNull: false },
      from_date: { type: DataTypes.DATE, allowNull: false },
      to_date: { type: DataTypes.DATE, allowNull: true },
      responsibilities: { type: DataTypes.TEXT, allowNull: true },
      reason_for_leaving: { type: DataTypes.STRING, allowNull: true },
      reference_name: { type: DataTypes.STRING, allowNull: true },
      reference_contact: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "previous_employments",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  PreviousEmployment.associate = (models) => {
    PreviousEmployment.belongsTo(models.SystemUsers, {
      foreignKey: "system_user_id",
      as: "user",
    });
  };

  return PreviousEmployment;
};
