const db = require("../models");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const getClientIp = require("../utils/getClientIp");
const { getCountryByIP } = require("../utils/ipGeolocation");
const {
  ProgramQuestion,
  ProgramQuestionOption,
  ProgramQuestionVote,
  ProgramQuestionFeedback,
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
      enable_feedback = false,
      enable_whatsapp = false,
      whatsapp_number,
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
        (o) => o.is_correct === 1 || o.is_correct === true,
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
      enable_feedback,
      enable_whatsapp,
      whatsapp_number,
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
      return res.status(400).json({
        message: "radio_program_id is required",
      });
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
        ["createdAt", "DESC"],
      ],
    });

    if (questions.length === 0) {
      return res.json({
        count: 0,
        data: [],
      });
    }

    const questionIds = questions.map((q) => q.id);
    const optionsIds = questions.flatMap((q) =>
      q.options.map((option) => option.id),
    );

    // Get vote counts with country breakdown
    const voteCounts = await ProgramQuestionVote.findAll({
      where: {
        program_question_option_id: optionsIds,
      },
      attributes: [
        "program_question_option_id",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "vote_count"],
      ],
      group: ["program_question_option_id"],
      raw: true,
    });

    // Get country breakdown for votes
    const voteCountries = await ProgramQuestionVote.findAll({
      where: {
        program_question_option_id: optionsIds,
      },
      attributes: [
        "program_question_option_id",
        "country",
        "country_name",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "country_count"],
      ],
      group: ["program_question_option_id", "country", "country_name"],
      raw: true,
    });

    // Get feedback with country data
    const feedbacks = await ProgramQuestionFeedback.findAll({
      where: {
        program_question_id: questionIds,
      },
      attributes: [
        "id",
        "answer_text",
        "ip_address",
        "country",
        "country_name",
        "createdAt",
        "program_question_id",
      ],
      order: [["createdAt", "DESC"]],
    });

    // Organize country data for votes
    const voteCountryMap = {};
    voteCountries.forEach((item) => {
      const optionId = item.program_question_option_id;
      if (!voteCountryMap[optionId]) {
        voteCountryMap[optionId] = [];
      }
      voteCountryMap[optionId].push({
        country: item.country,
        country_name: item.country_name,
        count: parseInt(item.country_count || 0),
      });
    });

    const voteCountMap = {};
    voteCounts.forEach((item) => {
      voteCountMap[item.program_question_option_id] = parseInt(item.vote_count);
    });

    const feedbackCounts = await ProgramQuestionFeedback.findAll({
      where: {
        program_question_id: questionIds,
      },
      attributes: [
        "program_question_id",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "feedback_count"],
      ],
      group: ["program_question_id"],
      raw: true,
    });

    const feedbackCountMap = {};
    feedbackCounts.forEach((item) => {
      feedbackCountMap[item.program_question_id] = parseInt(
        item.feedback_count,
      );
    });

    const feedbacksQuestion = {};
    feedbacks.forEach((feedback) => {
      const questionId = feedback.program_question_id;

      if (!feedbacksQuestion[questionId]) {
        feedbacksQuestion[questionId] = [];
      }

      if (feedbacksQuestion[questionId]) {
        feedbacksQuestion[questionId].push(feedback.toJSON());
      }
    });

    const questionsWithDetails = questions.map((question) => {
      const questionJSON = question.toJSON();

      let totalVotes = 0;
      const optionsWithPercentage = questionJSON.options.map((option) => {
        const voteCount = voteCountMap[option.id] || 0;
        totalVotes += voteCount;

        return {
          ...option,
          vote_count: voteCount,
          country_breakdown: voteCountryMap[option.id] || [], // Add country breakdown
        };
      });

      optionsWithPercentage.forEach((option) => {
        option.percentage =
          totalVotes > 0
            ? ((option.vote_count / totalVotes) * 100).toFixed(2)
            : 0;
      });

      return {
        ...questionJSON,
        options: optionsWithPercentage,
        total_votes: totalVotes,
        feedback_count: feedbackCountMap[question.id] || 0,
        feedbacks: feedbacksQuestion[question.id] || [],
      };
    });

    return res.json({
      count: questionsWithDetails.length,
      data: questionsWithDetails,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      message: "Failed to fetch program Questions",
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
    const { question_id, option_id, device_id } = req.body;

    if (!question_id || !option_id || !device_id) {
      return res.status(400).json({
        message: "question, option and device Id are required",
      });
    }

    const ipAddress = getClientIp(req);
    const user_agent = req.headers["user-agent"] || null;

    const { country, country_name } = await getCountryByIP(ipAddress);

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

    const alreadyVoted = await ProgramQuestionVote.findOne({
      where: {
        program_question_id: question_id,
        device_id,
      },
    });

    if (alreadyVoted) {
      return res.status(409).json({
        message: "You have already voted for this question",
      });
    }

    await ProgramQuestionVote.create({
      program_question_id: question_id,
      program_question_option_id: option_id,
      device_id,
      ip_address: ipAddress,
      user_agent,
      country,
      country_name,
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

exports.postFeedback = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { answer_text, device_id } = req.body;

    if (!question_id || !device_id) {
      return res.status(400).json({
        message: "question_id and device_id are required",
      });
    }

    if (!answer_text || answer_text.trim().length === 0) {
      return res.status(400).json({ message: "Feedback cannot be empty" });
    }

    const question = await ProgramQuestion.findOne({
      where: { id: question_id, status: "active" },
    });

    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found or inactive" });
    }

    const ip_address = getClientIp(req);
    const user_agent = req.headers["user-agent"] || null;
    const { country, country_name } = await getCountryByIP(ip_address);

    const existing = await ProgramQuestionFeedback.findOne({
      where: {
        program_question_id: question_id,
        device_id,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already submitted feedback for this question",
      });
    }

    await ProgramQuestionFeedback.create({
      program_question_id: question_id,
      answer_text,
      device_id,
      ip_address,
      user_agent,
      country,
      country_name,
    });

    return res.status(201).json({
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Feedback Error:", error);
    return res.status(500).json({
      message: "Failed to submit feedback",
    });
  }
};

exports.getQuestionResults = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { device_id } = req.query;

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
      0,
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

    let userVote = null;

    if (device_id) {
      userVote = await ProgramQuestionVote.findOne({
        where: {
          program_question_id: question_id,
          device_id,
        },
        attributes: ["program_question_option_id"],
        raw: true,
      });
    }

    const correctOption = options.find((o) => Boolean(o.is_correct));

    return res.json({
      totalVotes,
      results,
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
    enable_feedback = false,
    enable_whatsapp = false,
    whatsapp_number,
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
      {
        question,
        question_type,
        start_date,
        end_date,
        status,
        enable_feedback,
        enable_whatsapp,
        whatsapp_number,
      },
      { transaction: t },
    );

    if (question_type === "quiz") {
      const correctCount = options.filter(
        (o) => o.is_correct === 1 || o.is_correct === true,
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
            },
          );
        } else {
          const created = await ProgramQuestionOption.create(
            {
              program_question_id: id,
              option_text: opt.option_text,
              is_correct: opt.is_correct === 1 || opt.is_correct === true,
            },
            { transaction: t },
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
