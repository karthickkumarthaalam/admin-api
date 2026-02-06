module.exports = (sequelize, DataTypes) => {
  const ProgramQuestionFeedback = sequelize.define(
    "ProgramQuestionFeedback",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      program_question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "program_questions", key: "id" },
        onDelete: "CASCADE",
      },
      answer_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "program_question_feedbacks",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["program_question_id", "device_id"],
        },
      ],
    },
  );

  ProgramQuestionFeedback.associate = (models) => {
    ProgramQuestionFeedback.belongsTo(models.ProgramQuestion, {
      foreignKey: "program_question_id",
      as: "question",
    });
  };

  return ProgramQuestionFeedback;
};
