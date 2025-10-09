module.exports = (sequelize, DataTypes) => {
  const PayslipItem = sequelize.define(
    "PayslipItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      payslip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "payslip",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      component_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "payslip_component",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM("earning", "deduction"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "payslip_item",
      timestamps: true,
      paranoid: true,
    }
  );

  PayslipItem.associate = (models) => {
    PayslipItem.belongsTo(models.Payslip, {
      foreignKey: "payslip_id",
      as: "payslip",
    });
    PayslipItem.belongsTo(models.PayslipComponent, {
      foreignKey: "component_id",
      as: "component",
    });
  };

  return PayslipItem;
};
