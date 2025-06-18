module.exports = (sequelize, DataTypes) => {
    const Banner = sequelize.define("Banner", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        banner_name: {
            type: DataTypes.STRING,
            allowNull: false
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

    return Banner;
};