
module.exports = (sequelize, DataTypes) => {
    const Currency = sequelize.define("Currency", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        country_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currency_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    return Currency;
};