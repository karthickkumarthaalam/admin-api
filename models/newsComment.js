module.exports = (sequelize, DataTypes) => {
  const NewsComments = sequelize.define(
    "NewsComments",
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
      guest_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guest_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "news_comments",
      timestamps: true,
      paranoid: true,
    }
  );

  NewsComments.associate = (models) => {
    NewsComments.belongsTo(models.Members, {
      foreignKey: "member_id",
    });

    NewsComments.belongsTo(models.News, {
      foreignKey: "news_id",
    });
  };

  return NewsComments;
};
