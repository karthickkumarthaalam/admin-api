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
      created_by_type: {
        type: DataTypes.ENUM("system", "creator"),
        defaultValue: "system",
        allowNull: false,
      },
      system_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "system_users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      podcast_creator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "podcast_creator",
          key: "id",
        },
        onDelete: "SET NULL",
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
    PodcastCategory.belongsTo(models.SystemUsers, {
      foreignKey: "system_user_id",
      as: "systemCreator",
    });
    PodcastCategory.belongsTo(models.PodcastCreator, {
      foreignKey: "podcast_creator_id",
      as: "creatorProfile",
    });
  };

  return PodcastCategory;
};
