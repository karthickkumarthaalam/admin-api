module.exports = (sequelize, DataTypes) => {
  const FinancialYear = sequelize.define(
    "FinancialYear",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      start_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      end_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "financial_year",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  FinancialYear.associate = (models) => {
    FinancialYear.hasMany(models.ExpenseBill, {
      foreignKey: "financial_year_id",
      as: "expenseBills",
    });

    FinancialYear.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return FinancialYear;
};
