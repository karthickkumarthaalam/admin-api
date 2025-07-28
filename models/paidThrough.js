module.exports = (sequelize, DataTypes) => {
    const PaidThrough = sequelize.define("PaidThrough", {
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
        tableName: "paid_through"
    });

    PaidThrough.associate = (models) => {
        PaidThrough.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return PaidThrough;
};
