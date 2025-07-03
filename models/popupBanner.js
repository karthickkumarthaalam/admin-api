module.exports = (sequelize, DataTypes) => {
    const PopupBanner = sequelize.define("PopupBanner", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        website_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mobile_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "in-active"),
            allowNull: false,
            defaultValue: "active"
        },
        language: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue('language');
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue('language', JSON.stringify(value));
            }
        }
    });

    return PopupBanner;
};