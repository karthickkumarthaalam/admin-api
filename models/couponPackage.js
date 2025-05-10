
module.exports = (sequelize, DataTypes) => {
    const CouponPackage = sequelize.define("CouponPackage", {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "coupons",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "packages",
                key: "id",
            },
            onDelete: "CASCADE",
        }

    });

    return CouponPackage;
};