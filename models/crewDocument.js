module.exports = (sequelize, DataTypes) => {
  const CrewDocument = sequelize.define(
    "CrewDocument",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      crew_list_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "crew_management_list",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      document_type: {
        type: DataTypes.ENUM(
          "passport_photo",
          "aadhar_card",
          "income_revenue",
          "passport",
          "visa",
          "other",
        ),
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "crew_documents",
      timestamps: true,
      paranoid: true,
    },
  );

  CrewDocument.associate = (models) => {
    CrewDocument.belongsTo(models.CrewManagementList, {
      foreignKey: "crew_list_id",
      as: "crew",
    });
  };

  return CrewDocument;
};
