
module.exports = (sequelize, DataTypes) => {
    const PasswordManager = sequelize.define("PasswordManager", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        service_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "password_manager"
    });

    return PasswordManager;
};