module.exports = (sequelize, DataTypes) => {
  const Blogs = sequelize.define(
    "Blogs",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cover_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      published_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publisher_id: {
        type: DataTypes.INTEGER,
        references: {
          models: "system_users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      published_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
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
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "blogs",
      timestamps: true,
      paranoid: true,
    }
  );

  Blogs.associate = (models) => {
    Blogs.belongsTo(models.SystemUsers, {
      foreignKey: "publisher_id",
      as: "publisher",
    });

    Blogs.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return Blogs;
};
