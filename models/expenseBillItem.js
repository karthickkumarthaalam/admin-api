module.exports = (sequelize, DataTypes) => {
  const ExpenseBillItem = sequelize.define(
    "ExpenseBillItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      expense_bill_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "expense_bill",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      bill_address: {
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
      tableName: "expense_bill_item",
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  ExpenseBillItem.associate = (models) => {
    ExpenseBillItem.belongsTo(models.ExpenseBill, {
      foreignKey: "expense_bill_id",
      as: "expenseBill",
    });
  };

  return ExpenseBillItem;
};
