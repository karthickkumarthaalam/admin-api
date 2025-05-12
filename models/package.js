module.exports = (sequelize, DataTypes) => {
    const Package = sequelize.define("Package", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        package_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        package_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        currency_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "currencies",
                key: "id"
            },
            onDelete: "CASCADE",
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        yearly_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        features: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "active",
        },
        language: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: "All"
        }
    });


    Package.associate = (models) => {

        Package.belongsToMany(models.Coupon, {
            through: models.CouponPackage,
            foreignKey: "package_id",
            otherKey: "coupon_id",
            as: "coupons"
        });


        Package.belongsTo(models.Currency, {
            foreignKey: "currency_id",
            as: "currency"
        });

        Package.hasMany(models.MemberPackage, {
            foreignKey: "package_id"
        });
    };

    return Package;
};