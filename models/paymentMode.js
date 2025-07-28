module.exports = (sequelize, DataTypes) => {
    const PaymentMode = sequelize.define("PaymentMode", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: "payment_mode"
    });

    PaymentMode.associate = (models) => {
        PaymentMode.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return PaymentMode;
};
