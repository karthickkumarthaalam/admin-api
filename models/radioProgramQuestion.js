module.exports = (sequelize, DataTypes) => {
  const RadioProgramQuestion = sequelize.define(
    "RadioProgramQuestion",
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
      radio_program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "RadioPrograms",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "radio_program_question",
      timestamps: true,
      paranoid: true,
    },
  );

  return RadioProgramQuestion;
};
