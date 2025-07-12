module.exports = (sequelize, DataTypes) => {
    const RadioStation = sequelize.define("RadioStation", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        station_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        radio_stream_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        play_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        redirect_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("active", "in-active"),
            defaultValue: "in-active"
        }
    }, {
        tableName: "radio_station"
    });

    return RadioStation;
};