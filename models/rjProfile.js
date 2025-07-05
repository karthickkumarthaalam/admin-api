module.exports = (sequelize, Datatypes) => {
    const RjProfile = sequelize.define("RjProfile", {
        id: {
            type: Datatypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: Datatypes.INTEGER,
            allowNull: false,
            reference: {
                model: "users",
                key: "id"
            },
            onDelete: "CASCADE"
        },
        name: {
            type: Datatypes.STRING,
            allowNull: false
        },
        email: {
            type: Datatypes.STRING,
            unique: true,
            allowNull: false,
        },
        gender: {
            type: Datatypes.STRING,
            allowNull: true
        },
        date_of_birth: {
            type: Datatypes.DATE,
            allowNull: true,
        },
        image_url: {
            type: Datatypes.STRING,
            allowNull: true
        },
        phone_number: {
            type: Datatypes.STRING,
            allowNull: true
        },
        whatsapp_number: {
            type: Datatypes.STRING,
            allowNull: true
        },
        address: {
            type: Datatypes.STRING,
            allowNull: true,
        },
        country: {
            type: Datatypes.STRING,
        },
        state: {
            type: Datatypes.STRING
        },
        city: {
            type: Datatypes.STRING
        },
        description: {
            type: Datatypes.TEXT
        },
        status: {
            type: Datatypes.ENUM("active", "inactive"),
            defaultValue: "active"
        }
    }, {
        tableName: 'rj_profiles',
        timeStamps: true
    });

    RjProfile.associate = (models) => {
        RjProfile.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "users"
        });
    };

    return RjProfile;
};

