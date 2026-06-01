module.exports = (sequelize, DataTypes) => {
  const NewsAdvertisement = sequelize.define(
    "NewsAdvertisement",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      headline: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cta: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      redirect_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      size: {
        type: DataTypes.ENUM("big", "small"),
        defaultValue: "small",
      },
    },
    {
      tableName: "news_advertisement",
      paranoid: true,
      timestamps: true,
    },
  );

  return NewsAdvertisement;
};
