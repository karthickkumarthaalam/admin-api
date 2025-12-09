module.exports = (sequelize, DataTypes) => {
  const BlogsCategory = sequelize.define(
    "BlogsCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_categories: {
        type: DataTypes.TEXT,
        allowNull: true,
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
          models: "Users",
          key: "id",
        },
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "blogs_category",
      timestamps: true,
      paranoid: true,
    }
  );

  BlogsCategory.associate = (models) => {
    BlogsCategory.belongsTo(models.SystemUsers, {
      foreignKey: "created_by",
      targetKey: "user_id",
      as: "creator",
    });
  };

  return BlogsCategory;
};
