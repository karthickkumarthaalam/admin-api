module.exports = (sequelize, DataTypes) => {
  const NewsMedia = sequelize.define(
    "NewsMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "News",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("image", "video"),
        defaultValue: "image",
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: "news_media",
      timestamps: true,
      paranoid: true,
    }
  );

  NewsMedia.associate = (models) => {
    NewsMedia.belongsTo(models.News, {
      foreignKey: "news_id",
      as: "news",
    });
  };

  return NewsMedia;
};
