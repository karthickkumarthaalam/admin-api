module.exports = (sequelize, DataTypes) => {
    const Merchant = sequelize.define("Merchant", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        merchant_name: {
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

    Merchant.associate = (models) => {
        Merchant.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return Merchant;
};