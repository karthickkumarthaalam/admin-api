module.exports = (sequelize, DataTypes) => {
  const AuditLogs = sequelize.define(
    "AuditLogs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      entity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      changed_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      changes: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "audit_logs",
      paranoid: true,
      timestamps: true,
    }
  );

  AuditLogs.associate = (models) => {
    AuditLogs.belongsTo(models.SystemUsers, {
      foreignKey: "changed_by",
      targetKey: "user_id",
      as: "user",
    });
  };

  return AuditLogs;
};
