module.exports = (sequelize, DataTypes) => {
  const ProgramQuestionOption = sequelize.define(
    "ProgramQuestionOption",
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
      option_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "program_question_options",
      timestamps: true,
      paranoid: true,
    }
  );

  ProgramQuestionOption.associate = (models) => {
    ProgramQuestionOption.belongsTo(models.ProgramQuestion, {
      foreignKey: "program_question_id",
      as: "question",
    });

    ProgramQuestionOption.hasMany(models.ProgramQuestionVote, {
      foreignKey: "program_question_option_id",
      as: "votes",
    });
  };

  return ProgramQuestionOption;
};
