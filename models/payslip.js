module.exports = (sequelize, DataTypes) => {
  const PaySlip = sequelize.define(
    "PaySlip",
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
      currency_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Currencies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      month: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paid_date: {
        type: DataTypes.DATEONLY,
        default: DataTypes.NOW,
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paid_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lop_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_deductions: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      conversion_currency_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Currencies",
          key: "id",
        },
      },
      converted_net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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
      tableName: "payslip",
      timestamps: true,
      paranoid: true,
    }
  );

  PaySlip.associate = (models) => {
    PaySlip.belongsTo(models.SystemUsers, {
      foreignKey: "user_id",
      as: "user",
    });

    PaySlip.hasMany(models.PayslipItem, {
      foreignKey: "payslip_id",
      as: "items",
    });

    PaySlip.belongsTo(models.Currency, {
      foreignKey: "currency_id",
      as: "currency",
    });

    PaySlip.belongsTo(models.Currency, {
      foreignKey: "conversion_currency_id",
      as: "conversionCurrency",
    });
  };

  return PaySlip;
};
