module.exports = (sequelize, DataTypes) => {
  const NewsReaction = sequelize.define(
    "NewsReaction",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      guest_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reaction: {
        type: DataTypes.ENUM("like", "dislike"),
        defaultValue: "like",
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "news_reactions",
      timestamps: true,
      paranoid: true,
    }
  );

  NewsReaction.associate = (models) => {
    NewsReaction.belongsTo(models.News, {
      foreignKey: "news_id",
    });

    NewsReaction.belongsTo(models.Members, {
      foreignKey: "member_id",
    });
  };

  return NewsReaction;
};
