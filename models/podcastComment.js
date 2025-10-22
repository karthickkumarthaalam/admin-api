module.exports = (Sequelize, DataTypes) => {
  const PodcastComment = Sequelize.define(
    "PodcastComment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
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
      tableName: "podcast_comments",
      timeStamps: false,
    }
  );

  PodcastComment.associate = (models) => {
    PodcastComment.belongsTo(models.Podcast, { foreignKey: "podcast_id" });
    PodcastComment.belongsTo(models.Members, { foreignKey: "member_id" });
  };

  return PodcastComment;
};
