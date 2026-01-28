module.exports = (sequelize, DataTypes) => {
  const PodcastAnalytics = sequelize.define(
    "PodcastAnalytics",
    {
      podcast_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "podcasts",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      play_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      shares_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "podcast_analytics",
      timestamps: false,
    },
  );

  PodcastAnalytics.associate = (models) => {
    PodcastAnalytics.belongsTo(models.Podcast, {
      foreignKey: "podcast_id",
    });
  };

  return PodcastAnalytics;
};
