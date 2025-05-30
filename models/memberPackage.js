
module.exports = (sequelize, DataTypes) => {
    const MemberPackage = sequelize.define("MemberPackage", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        member_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Members",
                key: "id"
            },
            onDelete: "CASCADE",
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Packages",
                key: "id"
            },
            onDelete: "CASCADE",
        },
        transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Transactions",
                key: "id"
            },
            onDelete: "CASCADE",
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            allowNull: false,
            defaultValue: "active"
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    MemberPackage.associate = (models) => {
        MemberPackage.belongsTo(models.Members, {
            foreignKey: "member_id",
            as: "member",
        });

        MemberPackage.belongsTo(models.Package, {
            foreignKey: "package_id",
            as: "package",
        });

        MemberPackage.belongsTo(models.Transaction, {
            foreignKey: "transaction_id",
            as: "transaction"
        });
    };

    return MemberPackage;
};