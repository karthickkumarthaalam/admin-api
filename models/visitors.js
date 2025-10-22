module.exports = (sequelize, DataTypes) => {
  const Visitors = sequelize.define(
    "Visitors",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      visitor_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: "unknown",
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: "unknown",
      },
      page: {
        type: DataTypes.STRING,
        defaultValue: "unknown",
      },
    },
    {
      tableName: "visitors",
      timestamps: true,
      updatedAt: false,
      createdAt: "created_at", // <-- match your migration column
    }
  );

  return Visitors;
};
