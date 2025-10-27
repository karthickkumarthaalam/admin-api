module.exports = (sequelize, DataTypes) => {
  const EmployeeDocuments = sequelize.define(
    "EmployeeDocuments",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      system_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "system_users", key: "id" },
        onDelete: "CASCADE",
      },
      doc_type: {
        type: DataTypes.ENUM(
          "aadhaar",
          "pan",
          "experience_letter",
          "bank_passbook",
          "offer_letter",
          "relieving_letter",
          "education_certificate",
          "other"
        ),
        allowNull: false,
      },
      file_name: { type: DataTypes.STRING, allowNull: false },
      file_url: { type: DataTypes.STRING, allowNull: false },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "employee_documents",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  EmployeeDocuments.associate = (models) => {
    EmployeeDocuments.belongsTo(models.SystemUsers, {
      foreignKey: "system_user_id",
      as: "user",
    });
  };

  return EmployeeDocuments;
};
