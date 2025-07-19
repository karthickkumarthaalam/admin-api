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
        }
    });

    return Merchant;
};