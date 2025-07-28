module.exports = (sequelize, DataTypes) => {
    const BudgetCategory = sequelize.define("BudgetCategory", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subCategories: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const raw = this.getDataValue('subCategories');
                return raw ? raw.split(',') : [];
            },
            set(value) {
                this.setDataValue('subCategories', Array.isArray(value) ? value.join(',') : value);
            }
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
        tableName: "budget_categories",
    });

    BudgetCategory.associate = (models) => {
        BudgetCategory.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };


    return BudgetCategory;
};