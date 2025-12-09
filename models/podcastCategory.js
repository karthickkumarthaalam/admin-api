module.exports = (sequelize, DataTypes) => {
  const PodcastCategory = sequelize.define(
    "PodcastCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "podcast_category",
      paranoid: true,
      timestamps: true,
    }
  );

  PodcastCategory.associate = (models) => {
    PodcastCategory.hasMany(models.Podcast, {
      foreignKey: "category_id",
      as: "podcasts",
    });
  };

  return PodcastCategory;
};
