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
        }
    }, {
        tableName: "paid_through"
    });

    return PaidThrough;
};
