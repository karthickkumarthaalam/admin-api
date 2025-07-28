module.exports = (sequelize, DataTypes) => {
    const Budget = sequelize.define("Budget", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        budget_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        from_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        to_date: {
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
        description: {
            type: DataTypes.TEXT,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE"
        }
    }, {
        timestamps: true
    });

    Budget.associate = (models) => {
        Budget.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator",
        });

        Budget.hasMany(models.BudgetItem, {
            foreignKey: "budget_id",
            as: "items",
            onDelete: "CASCADE"
        });
        Budget.belongsTo(models.Currency, {
            foreignKey: "currency_id",
            as: "currency"
        });
    };

    return Budget;
};