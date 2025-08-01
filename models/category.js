module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("Category", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE"
        }
    });

    Category.associate = (models) => {
        Category.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return Category;
};