module.exports = (sequelize, DataTypes) => {
  const CrewManagementDocument = sequelize.define(
    "CrewManagementDocument",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      crew_management_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "crew_management",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      document_type: {
        type: DataTypes.ENUM(
          "invitation_letter",
          "covering_letter",
          "crew_list",
          "flyer",
          "thaalam_profile",
          "hotel_itinerary",
          "switzerland_residence_id",
          "company_registration",
          "passport",
        ),
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "crew_management_document",
      timestamps: true,
    },
  );

  CrewManagementDocument.associate = (models) => {
    CrewManagementDocument.belongsTo(models.CrewManagement, {
      foreignKey: "crew_management_id",
      as: "crew_management",
    });
  };

  return CrewManagementDocument;
};
