module.exports = (sequelize, DataTypes) => {
  const FestivalGif = sequelize.define(
    "FestivalGif",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      left_side_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      right_side_image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: "festival_gif",
      timestamps: true,
    }
  );

  return FestivalGif;
};
