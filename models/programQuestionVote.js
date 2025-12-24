module.exports = (sequelize, DataTypes) => {
  const ProgramQuestionVote = sequelize.define(
    "ProgramQuestionVote",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      program_question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "program_questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      program_question_option_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "program_question_options",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "program_question_votes",
      timestamps: true,

      indexes: [
        {
          unique: true,
          fields: ["program_question_id", "ip_address"],
        },
        {
          fields: ["program_question_option_id"],
        },
      ],
    }
  );

  ProgramQuestionVote.associate = (models) => {
    ProgramQuestionVote.belongsTo(models.ProgramQuestion, {
      foreignKey: "program_question_id",
      as: "question",
    });

    ProgramQuestionVote.belongsTo(models.ProgramQuestionOption, {
      foreignKey: "program_question_option_id",
      as: "option",
    });
  };

  return ProgramQuestionVote;
};
