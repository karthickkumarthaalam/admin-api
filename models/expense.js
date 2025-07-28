module.exports = (sequelize, DataTypes) => {
    const Expenses = sequelize.define("Expenses", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        document_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        merchant: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        total_amount: {
            type: DataTypes.FLOAT
        },
        vendor_type: {
            type: DataTypes.ENUM("vendor", "user"),
            allowNull: true,
            defaultValue: "vendor"
        },
        pending_amount: {
            type: DataTypes.FLOAT
        },
        completed_date: {
            type: DataTypes.DATEONLY
        },
        status: {
            type: DataTypes.ENUM("pending", "completed"),
            allowNull: false,
            defaultValue: "pending"
        },
        paid_through: {
            type: DataTypes.INTEGER,
            references: {
                model: "paid_through",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        payment_mode: {
            type: DataTypes.INTEGER,
            references: {
                model: "payment_mode",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        created_by: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE"
        }
    }, {
        tableName: "expenses",
    });

    Expenses.associate = (models) => {
        Expenses.belongsTo(models.PaidThrough, {
            foreignKey: "paid_through",
            as: "paidThrough"
        });
        Expenses.belongsTo(models.PaymentMode, {
            foreignKey: "payment_mode",
            as: "paymentMode"
        });
        Expenses.hasMany(models.ExpenseCategory, {
            foreignKey: "expense_id",
            as: "categories",
            onDelete: "CASCADE"
        });
        Expenses.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return Expenses;
};
