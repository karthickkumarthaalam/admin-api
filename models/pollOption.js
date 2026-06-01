module.exports = (sequelize, DataTypes) => {
  const PollOption = sequelize.define(
    "PollOption",
    {
      poll_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      vote_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      position: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "poll_options",
      timestamps: true,
    },
  );

  PollOption.associate = (models) => {
    PollOption.belongsTo(models.Poll, {
      foreignKey: "poll_id",
      as: "poll",
    });

    PollOption.hasMany(models.PollVote, {
      foreignKey: "option_id",
      as: "votes",
      onDelete: "CASCADE",
    });
  };

  return PollOption;
};
