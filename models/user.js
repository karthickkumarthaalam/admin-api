module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otpExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM("admin", "rj"),
            defaultValue: "admin",
        },
        acl: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('acl');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('acl', JSON.stringify(value));
            }
        }
    });

    return User;
};