
module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define("Module", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unqiue: true
        }
    }, {
        tableName: "modules",
        timeStamps: true
    });

    Module.associate = (models) => {
        Module.hasMany(models.UserPermission, {
            foreignKey: "module_id",
            as: "userPermissions"
        });
    };


    return Module;
};