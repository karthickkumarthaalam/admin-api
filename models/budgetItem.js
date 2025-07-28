module.exports = (sequelize, DataTypes) => {
    const BudgetItem = sequelize.define("BudgetItem", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        budget_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "budgets",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sub_category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        merchant: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.FLOAT,
        },
        units: {
            type: DataTypes.STRING,
        },
        total_amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        actual_amount: {
            type: DataTypes.FLOAT,
        },
        description: {
            type: DataTypes.STRING,
        },
        budget_type: {
            type: DataTypes.ENUM("expense", "income", "sponsers"),
            defaultValue: "expense"
        }
    }, {
        tableName: "budget_items"
    });

    BudgetItem.associate = (models) => {
        BudgetItem.belongsTo(models.Budget, {
            foreignKey: "budget_id",
            as: "budget"
        });
    };

    return BudgetItem;
};