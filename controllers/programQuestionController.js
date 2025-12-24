const db = require("../models");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const getClientIp = require("../utils/getClientIp");
const {
  ProgramQuestion,
  ProgramQuestionOption,
  ProgramQuestionVote,
  RadioProgram,
} = db;

exports.createProgramQuesiton = async (req, res) => {
  try {
    const {
      radio_program_id,
      question,
      question_type,
      start_date,
      end_date,
      status = "inactive",
      options = [],
    } = req.body;

    if (!radio_program_id || !question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "At least 2 options required" });
    }

    if (question_type === "quiz") {
      const correctCount = options.filter(
        (o) => o.is_correct === 1 || o.is_correct === true
      ).length;

      if (correctCount !== 1) {
        return res.status(400).json({
          message: "Quiz must have exactly one correct option",
        });
      }
    }

    const programQuestion = await ProgramQuestion.create({
      radio_program_id,
      question,
      question_type,
      status,
      start_date,
      end_date,
    });

    const optionPayload = options.map((opt) => ({
      program_question_id: programQuestion.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct || false,
    }));

    await ProgramQuestionOption.bulkCreate(optionPayload);

    res.status(201).json({
      message: "Question created successfully",
      data: programQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create question" });
  }
};

exports.getProgramQuestions = async (req, res) => {
  try {
    const { radio_program_id } = req.params;

    if (!radio_program_id) {
      return res.status(400).json({ message: "radio_program_id is required" });
    }

    const questions = await ProgramQuestion.findAll({
      where: {
        radio_program_id,
      },
      include: [
        {
          model: ProgramQuestionOption,
          as: "options",
          attributes: ["id", "option_text", "is_correct"],
        },
      ],
      order: [
        ["start_date", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    return res.json({
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("List Program Questions Error:", error);
    return res.status(500).json({
      message: "Failed to fetch program questions",
    });
  }
};

exports.getActiveProgramQuestionsPublic = async (req, res) => {
  try {
    const { radio_program_id } = req.params;

    const swissNow = moment().tz("Europe/Zurich");
    const swissStartOfDay = swissNow.clone().startOf("day").toDate();
    const swissEndOfDay = swissNow.clone().endOf("day").toDate();

    const questions = await ProgramQuestion.findAll({
      where: {
        radio_program_id,
        status: "active",
        start_date: { [Op.lte]: swissEndOfDay },
        end_date: { [Op.gte]: swissStartOfDay },
      },
      include: [
        {
          model: ProgramQuestionOption,
          as: "options",
          attributes: ["id", "option_text"],
        },
      ],
      order: [
        ["start_date", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    res.json({
      count: questions.length || 0,
      data: questions || [],
      timezone: "Europe/Zurich",
      swiss_day: {
        start: swissStartOfDay,
        end: swissEndOfDay,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

exports.voteForQuestion = async (req, res) => {
  try {
    const { question_id, option_id } = req.body;

    if (!question_id || !option_id) {
      return res.status(400).json({
        message: "question and option are required",
      });
    }

    const ipAddress = getClientIp(req);
    const user_agent = req.headers["user-agent"] || null;

    const question = await ProgramQuestion.findOne({
      where: {
        id: question_id,
        status: "active",
      },
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found or inactive",
      });
    }

    const now = new Date();
    if (now < question.start_date || now > question.end_date) {
      return res.status(403).json({
        message: "Voting is not active for this question",
      });
    }

    const option = await ProgramQuestionOption.findOne({
      where: {
        id: option_id,
        program_question_id: question_id,
      },
    });

    if (!option) {
      return res.status(400).json({
        message: "Invalid option for this question",
      });
    }
    await ProgramQuestionVote.create({
      program_question_id: question_id,
      program_question_option_id: option_id,
      ip_address: ipAddress,
      user_agent,
    });

    return res.status(201).json({
      message: "Vote submitted successfully",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "You have already voted for this question",
      });
    }

    return res.status(500).json({
      message: "Failed to submit vote",
    });
  }
};

exports.getQuestionResults = async (req, res) => {
  try {
    const { question_id } = req.params;

    if (!question_id) {
      return res.status(400).json({ message: "question_id is required" });
    }

    /* ---------------- GET OPTIONS + VOTES ---------------- */

    const options = await ProgramQuestionOption.findAll({
      where: { program_question_id: question_id },
      attributes: [
        "id",
        "option_text",
        "is_correct",
        [Sequelize.fn("COUNT", Sequelize.col("votes.id")), "vote_count"],
      ],
      include: [
        {
          model: ProgramQuestionVote,
          as: "votes",
          attributes: [],
          required: false,
        },
      ],
      group: ["ProgramQuestionOption.id"],
      raw: true,
    });

    if (!options.length) {
      return res.status(404).json({
        message: "Question options not found",
      });
    }

    /* ---------------- TOTAL VOTES ---------------- */

    const totalVotes = options.reduce(
      (sum, o) => sum + Number(o.vote_count || 0),
      0
    );

    /* ---------------- POLL RESULTS (ALWAYS SAFE) ---------------- */

    const results = options.map((o) => {
      const votes = Number(o.vote_count || 0);
      return {
        option_id: o.id,
        option_text: o.option_text,
        votes,
        percentage:
          totalVotes === 0
            ? 0
            : Number(((votes / totalVotes) * 100).toFixed(2)),
      };
    });

    /* ---------------- FIND USER VOTE (IP BASED) ---------------- */

    const clientIp = getClientIp(req);

    const userVote = await ProgramQuestionVote.findOne({
      where: {
        program_question_id: question_id,
        ip_address: clientIp,
      },
      attributes: ["program_question_option_id"],
      raw: true,
    });

    /* ---------------- QUIZ LOGIC ---------------- */

    const correctOption = options.find((o) => Boolean(o.is_correct));

    return res.json({
      totalVotes,
      results,

      /*
        🔐 QUIZ RULES:
        - If user has NOT voted → do NOT send correct answer
        - If user HAS voted → send correct + selected option
      */
      quiz: userVote
        ? {
            correct_option_id: correctOption?.id || null,
            selected_option_id: userVote.program_question_option_id,
          }
        : null,
    });
  } catch (error) {
    console.error("Results Error:", error);
    return res.status(500).json({
      message: "Failed to fetch results",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    const question = await ProgramQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.status = status;

    await question.save();
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

exports.updateProgramQuestion = async (req, res) => {
  const { id } = req.params;
  const {
    question,
    question_type,
    start_date,
    end_date,
    status,
    options = [],
  } = req.body;

  const t = await db.sequelize.transaction();

  try {
    const programQuestion = await ProgramQuestion.findByPk(id, {
      transaction: t,
    });

    if (!programQuestion) {
      await t.rollback();
      return res.status(404).json({ message: "Question not found" });
    }

    await programQuestion.update(
      { question, question_type, start_date, end_date, status },
      { transaction: t }
    );

    if (question_type === "quiz") {
      const correctCount = options.filter(
        (o) => o.is_correct === 1 || o.is_correct === true
      ).length;

      if (correctCount !== 1) {
        throw new Error("Quiz must have exactly one correct option");
      }
    }

    if (Array.isArray(options)) {
      const existingOptions = await ProgramQuestionOption.findAll({
        where: { program_question_id: id },
        transaction: t,
      });

      const existingMap = new Map(existingOptions.map((opt) => [opt.id, opt]));

      const incomingIds = [];

      for (const opt of options) {
        if (opt.id && existingMap.has(opt.id)) {
          incomingIds.push(opt.id);

          await existingMap.get(opt.id).update(
            {
              option_text: opt.option_text,
              is_correct: opt.is_correct === 1 || opt.is_correct === true,
            },
            {
              transaction: t,
            }
          );
        } else {
          const created = await ProgramQuestionOption.create(
            {
              program_question_id: id,
              option_text: opt.option_text,
              is_correct: opt.is_correct === 1 || opt.is_correct === true,
            },
            { transaction: t }
          );

          incomingIds.push(created.id);
        }
      }

      // 3️⃣ DELETE removed options
      const toDelete = existingOptions
        .filter((opt) => !incomingIds.includes(opt.id))
        .map((opt) => opt.id);

      if (toDelete.length > 0) {
        await ProgramQuestionOption.destroy({
          where: { id: toDelete },
          transaction: t,
        });
      }
    }

    await t.commit();

    return res.status(200).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({
      message: "Failed to update questions",
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await ProgramQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await question.destroy();

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question" });
  }
};
