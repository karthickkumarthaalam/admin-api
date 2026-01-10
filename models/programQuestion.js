module.exports = (sequelize, DataTypes) => {
  const ProgramQuestion = sequelize.define(
    "ProgramQuestion",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      question_type: {
        type: DataTypes.ENUM("poll", "quiz"),
        allowNull: false,
        defaultValue: "poll",
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("active", "in-active"),
        defaultValue: "active",
      },

      enable_feedback: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },

      enable_whatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },

      whatsapp_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "program_questions",
      timestamps: true,
      paranoid: true,
    }
  );

  ProgramQuestion.associate = (models) => {
    ProgramQuestion.belongsTo(models.RadioProgram, {
      foreignKey: "radio_program_id",
      as: "radio_program",
    });

    ProgramQuestion.hasMany(models.ProgramQuestionOption, {
      foreignKey: "program_question_id",
      as: "options",
    });

    ProgramQuestion.hasMany(models.ProgramQuestionFeedback, {
      foreignKey: "program_question_id",
      as: "feedbacks",
    });
  };

  return ProgramQuestion;
};
