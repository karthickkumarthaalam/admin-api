module.exports = (sequelize, DataTypes) => {
    const BudgetUnits = sequelize.define("BudgetUnits", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        units_name: {
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
        tableName: "budget_units"
    });

    BudgetUnits.associate = (models) => {
        BudgetUnits.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return BudgetUnits;
};