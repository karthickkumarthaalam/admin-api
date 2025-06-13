module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define("Transaction", {
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
                key: "id",
            },
            onDelete: "CASCADE",
        },
        package_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Packages",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM("completed", "pending", "failed", "refunded"),
            allowNull: false,
        },
        payment_proof: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        refund_status: {
            type: DataTypes.ENUM("not_requested", "pending", "approved", "rejected", "refunded"),
            defaultValue: "not_requested"
        },
        refund_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        refund_requested_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.Members, {
            foreignKey: "member_id",
            as: "member",
        });

        Transaction.belongsTo(models.Package, {
            foreignKey: "package_id",
            as: "package",
        });
    };

    return Transaction;
};
