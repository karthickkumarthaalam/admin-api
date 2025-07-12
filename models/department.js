module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define("Department", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        department_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "in-active"),
            defaultValue: "active",
        },
    }, {
        tableName: "departments"
    });

    return Department;
};
