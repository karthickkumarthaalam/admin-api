module.exports = (sequelize, DataTypes) => {
    const ExpenseCategory = sequelize.define("ExpenseCategory", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        expense_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "expenses",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        actual_amount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        paid_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        currency_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Currencies",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        status: {
            type: DataTypes.ENUM("pending", "completed"),
            allowNull: false,
            defaultValue: "pending"
        },
        bill_drive_file_id: {
            type: DataTypes.STRING
        },
        bill_drive_link: {
            type: DataTypes.STRING
        }
    }, {
        tableName: "expense_categories",
    });

    ExpenseCategory.associate = (models) => {
        ExpenseCategory.belongsTo(models.Expenses, {
            foreignKey: "expense_id",
            as: "expense"
        });
        ExpenseCategory.belongsTo(models.Currency, {
            foreignKey: "currency_id",
            as: "currency"
        });
    };

    return ExpenseCategory;
};
