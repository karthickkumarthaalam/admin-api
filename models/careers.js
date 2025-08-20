module.exports = (sequelize, DataTypes) => {
    const Careers = sequelize.define("Careers", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        current_job: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_experienced: {
            type: DataTypes.ENUM("yes", "no"),
            allowNull: false,
        },
        job_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        experience: {
            type: DataTypes.TEXT,
        },
        document: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        application_reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        tableName: "careers"
    });

    return Careers;
};