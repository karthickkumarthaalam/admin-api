module.exports = (sequelize, DataTypes) => {
  const AgreementCategory = sequelize.define(
    "AgreementCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "agreement_category",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return AgreementCategory;
};
