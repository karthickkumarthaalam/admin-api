module.exports = (sequelize, DataTypes) => {
  const Poll = sequelize.define(
    "Poll",
    {
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      description: DataTypes.TEXT,

      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      start_date: DataTypes.DATE,

      end_date: DataTypes.DATE,

      allow_multiple: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      total_votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "polls",
      timestamps: true,
    },
  );

  Poll.associate = (models) => {
    Poll.hasMany(models.PollOption, {
      foreignKey: "poll_id",
      as: "options",
      onDelete: "CASCADE",
    });

    Poll.hasMany(models.PollVote, {
      foreignKey: "poll_id",
      as: "votes",
      onDelete: "CASCADE",
    });
  };

  return Poll;
};
