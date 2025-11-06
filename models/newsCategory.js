module.exports = (sequelize, DataTypes) => {
  const NewsCategory = sequelize.define(
    "NewsCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_categories: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const raw = this.getDataValue("sub_categories");
          return raw ? raw.split(",") : [];
        },
        set(value) {
          this.setDataValue(
            "sub_categories",
            Array.isArray(value) ? value.join(",") : value
          );
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "news_category",
      timestamps: true,
      paranoid: true,
    }
  );

  NewsCategory.associate = (models) => {
    NewsCategory.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return NewsCategory;
};
