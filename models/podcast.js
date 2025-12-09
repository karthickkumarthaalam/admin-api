module.exports = (sequelize, DataTypes) => {
  const Podcast = sequelize.define(
    "Podcast",
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rjname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rj_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "system_users",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      audio_drive_file_id: {
        type: DataTypes.STRING,
      },
      audio_drive_file_link: {
        type: DataTypes.STRING,
      },
      video_link: {
        type: DataTypes.STRING,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "reviewing", "approved"),
        defaultValue: "pending",
        allowNull: false,
      },
      status_updated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "podcast_category",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      language: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '["All"]',
        get() {
          const value = this.getDataValue("language");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue("language", JSON.stringify(value));
          } else if (typeof value === "string" && value.startsWith("[")) {
            try {
              const arr = JSON.parse(value);
              this.setDataValue("language", JSON.stringify(arr));
            } catch (err) {
              this.setDataValue("language", JSON.stringify(["All"]));
            }
          } else {
            this.setDataValue("language", JSON.stringify(["All"]));
          }
        },
      },
      tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "[]",
        get() {
          const value = this.getDataValue("tags");
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue("tags", JSON.stringify(value));
          } else if (typeof value === "string" && value.startsWith("[")) {
            try {
              const arr = JSON.parse(value);
              this.setDataValue("tags", JSON.stringify(arr));
            } catch (error) {
              this.setDataValue("tags", JSON.stringify([]));
            }
          } else {
            this.setDataValue("tags", JSON.stringify([]));
          }
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "podcasts",
      timestamps: false,
      paranoid: true,
    }
  );

  Podcast.associate = (models) => {
    Podcast.belongsTo(models.SystemUsers, {
      foreignKey: "rj_id",
      as: "rj",
    });
    Podcast.belongsTo(models.PodcastCategory, {
      foreignKey: "category_id",
      as: "category",
    });
    Podcast.hasMany(models.PodcastComment, { foreignKey: "podcast_id" });
    Podcast.hasMany(models.PodcastReaction, { foreignKey: "podcast_id" });
    Podcast.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return Podcast;
};
