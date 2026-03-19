module.exports = (sequelize, DataTypes) => {
  const ProgramCategoryFlashNews = sequelize.define(
    "ProgramCategoryFlashNews",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      program_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      flash_news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "program_category_flash_news",
    },
  );

  return ProgramCategoryFlashNews;
};
