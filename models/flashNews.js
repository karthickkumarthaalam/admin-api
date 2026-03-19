module.exports = (sequelize, DataTypes) => {
  const FlashNews = sequelize.define(
    "FlashNews",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      news_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: DataTypes.ENUM("active", "in-active"),
        defaultValue: "active",
      },
    },
    {
      tableName: "flash_news",
      timestamps: true,
    },
  );

  FlashNews.associate = (models) => {
    FlashNews.belongsToMany(models.ProgramCategory, {
      through: "program_category_flash_news",
      foreignKey: "flash_news_id",
      as: "categories",
    });
  };

  return FlashNews;
};
