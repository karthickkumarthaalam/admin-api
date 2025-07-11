module.exports = (sequelize, DataTypes) => {
    const PasswordManagerAccess = sequelize.define("PasswrordManagerAccess", {
        access_password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: "password_manager_access"
    });

    return PasswordManagerAccess;
};