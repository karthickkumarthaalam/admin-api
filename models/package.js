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
                model: "Currencies",
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
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('features');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('features', JSON.stringify(value));
            }
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
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '["All"]',
            get() {
                const value = this.getDataValue('language');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('language', JSON.stringify(value));
            }
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