module.exports = (sequelize, DataTypes) => {
    const BudgetTaxApplications = sequelize.define("BudgetTaxApplications", {
        budget_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "budgets",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        tax_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "budget_taxes",
                key: "id"
            }
        },
        base_amount: { type: DataTypes.FLOAT, allowNull: false },
        tax_amount: { type: DataTypes.FLOAT, allowNull: false }
    }, {
        tableName: "budget_tax_applications",
        timestamps: true
    });

    BudgetTaxApplications.associate = (models) => {
        BudgetTaxApplications.belongsTo(models.Budget, { foreignKey: "budget_id", as: "budget" });
        BudgetTaxApplications.belongsTo(models.BudgetTaxes, { foreignKey: "tax_id", as: "tax" });
    };

    return BudgetTaxApplications;
};
