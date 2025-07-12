module.exports = (sequelize, DataTypes) => {
    const RadioProgram = sequelize.define("RadioProgram", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        program_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "program_category",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        rj_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "system_users",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true
        },
        radio_station_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "radio_station",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        broadcast_days: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ""
        },
        status: {
            type: DataTypes.ENUM("active", "in-active"),
            defaultValue: "in-active"
        },
        show_host_name: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        show_program_name: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        show_timing: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        show_host_profile: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    RadioProgram.associate = (models) => {
        RadioProgram.belongsTo(models.ProgramCategory, {
            foreignKey: "program_category_id",
            as: "program_category"
        });

        RadioProgram.belongsTo(models.SystemUsers, {
            foreignKey: "rj_id",
            as: "system_users"
        });

        RadioProgram.belongsTo(models.RadioStation, {
            foreignKey: "radio_station_id",
            as: "radio_station"
        });
    };

    return RadioProgram;
};
