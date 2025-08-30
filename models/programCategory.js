module.exports = (sequelize, DataTypes) => {
    const ProgramCategory = sequelize.define("ProgramCategory", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("active", "in-active"),
            allowNull: false,
            defaultValue: "in-active"
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: "program_category"
    });

    return ProgramCategory;
};
