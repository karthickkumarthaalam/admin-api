
module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("Coupon", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        coupon_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coupon_code: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        redirect_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive", "expired"),
            allowNull: false,
            defaultValue: "active"
        }

    });

    Coupon.associate = (models) => {
        Coupon.belongsToMany(models.Package, {
            through: models.CouponPackage,
            foreignKey: "coupon_id",
            otherKey: "package_id",
            as: "packages"
        });
    };

    return Coupon;
};