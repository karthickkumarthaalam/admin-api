
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
        address1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address2: {
            type: DataTypes.STRING,
            allowNull: true
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
        otp_expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false,
        },
        stripe_customer_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        payment_method_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        auto_renew: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    Members.associate = (models) => {
        Members.hasOne(models.MemberPackage, { foreignKey: "member_id" });
    };


    return Members;
};