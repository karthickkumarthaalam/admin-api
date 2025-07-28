
module.exports = (sequelize, DataTypes) => {
    const BudgetMerchant = sequelize.define("BudgetMerchant", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        merchant_name: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: "budget_merchants"
    });

    BudgetMerchant.associate = (models) => {
        BudgetMerchant.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return BudgetMerchant;
};