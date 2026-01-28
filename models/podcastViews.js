module.exports = (sequelize, DataTypes) => {
  const PodcastView = sequelize.define(
    "PodcastView",
    {
      podcast_id: {
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

      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "podcast_views",
      timestamps: false,
      indexes: [
        {
          fields: ["podcast_id", "member_id"],
        },
        {
          fields: ["podcast_id", "guest_id"],
        },
        {
          fields: ["podcast_id", "ip_address"],
        },
      ],
    },
  );
  PodcastView.associate = (models) => {
    PodcastView.belongsTo(models.Podcast, {
      foreignKey: "podcast_id",
    });
  };

  return PodcastView;
};
