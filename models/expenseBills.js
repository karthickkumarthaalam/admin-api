module.exports = (sequelize, DataTypes) => {
  const ExpenseBill = sequelize.define(
    "ExpenseBill",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      financial_year_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "financial_year",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("income", "expense", "payable", "others"),
        defaultValue: "expense",
        allowNull: false,
      },
      currency_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Currencies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
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
      tableName: "expense_bill",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  ExpenseBill.associate = (models) => {
    ExpenseBill.belongsTo(models.FinancialYear, {
      foreignKey: "financial_year_id",
      as: "financialYear",
    });

    ExpenseBill.hasMany(models.ExpenseBillItem, {
      foreignKey: "expense_bill_id",
      as: "bills",
      onDelete: "CASCADE",
    });

    ExpenseBill.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });

    ExpenseBill.belongsTo(models.Currency, {
      foreignKey: "currency_id",
      as: "currency",
    });
  };

  return ExpenseBill;
};
