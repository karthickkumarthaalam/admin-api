
module.exports = (sequelize, DataTypes) => {
    const UserPermission = sequelize.define("UserPermission", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        system_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "system_users",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "modules",
                key: "id"
            }
        },
        access_type: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "user_permissions",
        timeStamps: true
    });

    UserPermission.associate = (models) => {
        UserPermission.belongsTo(models.SystemUsers, {
            foreignKey: "system_user_id",
            as: "systemUser"
        });
        UserPermission.belongsTo(models.Module, {
            foreignKey: "module_id",
            as: "module"
        });
    };

    return UserPermission;
};