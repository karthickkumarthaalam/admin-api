
module.exports = (sequalize, DataTypes) => {
    const Members = sequalize.define("Members", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        member_id: {
            type: DataTypes.STRING(6),
            unique: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['Male', 'Female', 'Other']]
            }
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
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    Members.associate = (models) => {
        Members.hasOne(models.MemberPackage, { foreignKey: "member_id" });
    };


    return Members;
};