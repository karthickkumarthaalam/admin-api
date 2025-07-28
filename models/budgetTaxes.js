module.exports = (sequelize, DataTypes) => {
    const BudgetTaxes = sequelize.define("BudgetTaxes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tax_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tax_percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            comment: "Tax rate as a percentage (e.g., 18 for 18%)"
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Optional description or notes about this tax"
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Use this to soft-disable a tax type"
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        }
    }, {
        tableName: "budget_taxes",
        timestamps: true
    });

    BudgetTaxes.associate = (models) => {
        BudgetTaxes.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return BudgetTaxes;
};
