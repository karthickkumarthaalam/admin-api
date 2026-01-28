module.exports = (sequelize, DataTypes) => {
  const PodcastShare = sequelize.define(
    "PodcastShare",
    {
      podcast_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "podcasts",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      guest_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      platform: {
        type: DataTypes.ENUM(
          "whatsapp",
          "facebook",
          "twitter",
          "instagram",
          "copy_link",
          "other",
        ),
        allowNull: false,
      },

      shared_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "podcast_shares",
      timestamps: false,
      indexes: [
        {
          fields: ["podcast_id", "member_id", "platform"],
        },
        {
          fields: ["podcast_id", "guest_id", "platform"],
        },
      ],
    },
  );

  PodcastShare.associate = (models) => {
    PodcastShare.belongsTo(models.Podcast, {
      foreignKey: "podcast_id",
    });
  };

  return PodcastShare;
};
