module.exports = (sequelize, DataTypes) => {
  const PollVote = sequelize.define(
    "PollVote",
    {
      poll_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      option_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      ip_address: DataTypes.STRING,

      user_agent: DataTypes.TEXT,

      voted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      user_id: DataTypes.INTEGER,
    },
    {
      tableName: "poll_vote",
      timestamps: false,
    },
  );

  PollVote.associate = (models) => {
    PollVote.belongsTo(models.Poll, {
      foreignKey: "poll_id",
      as: "poll",
    });

    PollVote.belongsTo(models.PollOption, {
      foreignKey: "option_id",
      as: "option",
    });
  };

  return PollVote;
};
