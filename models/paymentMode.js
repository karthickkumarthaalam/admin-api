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
        }
    }, {
        tableName: "payment_mode"
    });

    return PaymentMode;
};
