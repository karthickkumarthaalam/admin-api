module.exports = (sequelize, DataTypes) => {
  const FlashNewsItem = sequelize.define(
    "FlashNewsItem",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      flash_news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "in-active"),
        defaultValue: "in-active",
      },
    },
    {
      tableName: "flash_news_items",
      timestamps: true,
    },
  );

  FlashNewsItem.associate = (models) => {
    FlashNewsItem.belongsTo(models.FlashNews, {
      foreignKey: "flash_news_id",
      as: "flashNews",
    });
  };

  return FlashNewsItem;
};
