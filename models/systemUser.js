module.exports = (sequelize, DataTypes) => {
    const SystemUsers = sequelize.define("SystemUsers", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            reference: {
                model: "users",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "departments",
                key: "id"
            },
            onDelete: "SET NULL"
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        whatsapp_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active"
        }
    }, {
        tableName: 'system_users',
        timestamps: true
    });

    SystemUsers.associate = (models) => {
        SystemUsers.belongsTo(models.Department, {
            foreignKey: "department_id",
            as: "department"
        });
        SystemUsers.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "users"
        });
    };

    return SystemUsers;
};
