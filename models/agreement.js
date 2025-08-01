module.exports = (sequelize, DataTypes) => {
    const Agreement = sequelize.define("Agreement", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        document_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pdf_drive_file_id: {
            type: DataTypes.STRING
        },
        pdf_drive_link: {
            type: DataTypes.STRING
        },
        signed_pdf_drive_file_id: {
            type: DataTypes.STRING
        },
        signed_pdf_drive_link: {
            type: DataTypes.STRING
        },
        created_by: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id"
            },
            onDelete: "CASCADE"
        }
    });

    Agreement.associate = (models) => {
        Agreement.belongsTo(models.SystemUsers, {
            foreignKey: "created_by",
            targetKey: "user_id",
            as: "creator"
        });
    };

    return Agreement;
};
