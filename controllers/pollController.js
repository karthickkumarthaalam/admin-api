const db = require("../models");
const { Poll, PollOption, PollVote } = db;
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const moment = require("moment");

exports.createPoll = async (req, res) => {
  try {
    const {
      question,
      description,
      options,
      start_date,
      end_date,
      allow_multiple,
      is_active,
    } = req.body;
    if (!question) {
      return res.status(400).json({
        status: "error",
        message: "Question is required",
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        status: "error",
        message: "At least 2 options are required",
      });
    }

    const poll = await Poll.create({
      question,
      description,
      start_date: start_date || null,
      end_date: end_date || null,
      allow_multiple: allow_multiple || false,
      is_active: is_active !== undefined ? is_active : true,
    });

    const optionPayload = options.map((option, index) => ({
      poll_id: poll.id,
      option_text: option.option_text,
      position: index,
    }));
    await PollOption.bulkCreate(optionPayload);

    const pollWithOptions = await Poll.findByPk(poll.id, {
      include: [
        {
          model: PollOption,
          as: "options",
          order: [["position", "ASC"]],
        },
      ],
    });

    return res.status(201).json({
      status: "success",
      message: "Poll created successfully",
      data: pollWithOptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to create poll",
      error: error.message,
    });
  }
};

exports.getPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {};
    if (req.query.search) {
      whereCondition[Op.or] = [
        { question: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const polls = await pagination(Poll, {
      page,
      limit,
      where: whereCondition,
      include: [{ model: PollOption, as: "options" }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      data: polls.data,
      pagination: polls.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch polls",
      error: error.message,
    });
  }
};

exports.getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: PollOption,
          as: "options",
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: poll,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch poll",
      error: error.message,
    });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id);

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    await poll.destroy();

    return res.status(200).json({
      status: "success",
      message: "Poll deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete poll",
      error: error.message,
    });
  }
};

exports.updatePollStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { is_active } = req.body;

    const poll = await Poll.findByPk(id);

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    poll.is_active = is_active;

    await poll.save();

    return res.status(200).json({
      status: "success",
      message: "Poll status updated successfully",
      data: poll,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update poll status",
      error: error.message,
    });
  }
};

exports.updatePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      question,
      description,
      options,
      start_date,
      end_date,
      is_active,
      allow_multiple,
    } = req.body;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: PollOption,
          as: "options",
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    poll.question = question || poll.question;
    poll.description = description || poll.description;
    poll.start_date = start_date || poll.start_date;
    poll.end_date = end_date || poll.end_date;
    poll.is_active = is_active !== undefined ? is_active : poll.is_active;
    poll.allow_multiple =
      allow_multiple !== undefined ? allow_multiple : poll.allow_multiple;

    await poll.save();

    if (Array.isArray(options) && options.length > 0) {
      const existingOptions = poll.options;
      const existingOptionIds = existingOptions.map((o) => o.id);
      const incomingOptionsIds = options.filter((o) => o.id).map((o) => o.id);

      const optionsToDelete = existingOptionIds.filter(
        (id) => !incomingOptionsIds.includes(id),
      );

      if (optionsToDelete.length > 0) {
        await PollOption.destroy({
          where: {
            id: optionsToDelete,
            poll_id: poll.id,
          },
        });
      }

      for (let i = 0; i < options.length; i++) {
        const option = options[i];

        if (option.id) {
          await PollOption.update(
            {
              option_text: option.option_text,
              position: i,
            },
            {
              where: {
                id: option.id,
                poll_id: poll.id,
              },
            },
          );
        } else {
          await PollOption.create({
            poll_id: poll.id,
            option_text: option.option_text,
            position: i,
          });
        }
      }
    }

    const updatedPoll = await Poll.findByPk(id, {
      include: [
        {
          model: PollOption,
          as: "options",
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: "Poll updated successfully",
      data: updatedPoll,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update poll",
      error: error.message,
    });
  }
};

exports.getActivePoll = async (req, res) => {
  try {
    const swissNow = moment().tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss");

    const polls = await Poll.findAll({
      where: {
        is_active: true,

        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              {
                start_date: {
                  [Op.lte]: swissNow,
                },
              },
            ],
          },
          {
            [Op.or]: [
              { end_date: null },
              {
                end_date: {
                  [Op.gte]: swissNow,
                },
              },
            ],
          },
        ],
      },

      order: [["start_date", "DESC"]],

      include: [
        {
          model: PollOption,
          as: "options",

          attributes: [
            "id",
            "poll_id",
            "option_text",
            "vote_count",
            "position",
          ],

          include: [
            {
              model: PollVote,
              as: "votes",
              attributes: ["id", "ip_address"],
            },
          ],
        },
      ],
    });

    const formattedPolls = polls.map((poll) => {
      let pollVoted = false;

      const formattedOptions = poll.options.map((option) => {
        const voted = option.votes.some((vote) => vote.ip_address === req.ip);

        if (voted) {
          pollVoted = true;
        }

        return {
          id: option.id,
          poll_id: option.poll_id,
          option_text: option.option_text,
          vote_count: option.vote_count,
          position: option.position,
          is_voted: voted,
        };
      });

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        is_active: poll.is_active,
        start_date: poll.start_date,
        end_date: poll.end_date,
        allow_multiple: poll.allow_multiple,
        total_votes: poll.total_votes,
        is_voted: pollVoted,
        options: formattedOptions,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPolls,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch active poll",
      error: error.message,
    });
  }
};

exports.submitVote = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { poll_id, option_ids, user_id } = req.body;

    if (!poll_id) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Poll id is required",
      });
    }

    if (!option_ids || !Array.isArray(option_ids) || option_ids.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Please select at least one option",
      });
    }

    const poll = await Poll.findByPk(poll_id, {
      include: [
        {
          model: PollOption,
          as: "options",
        },
      ],
      transaction,
    });

    if (!poll) {
      await transaction.rollback();

      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    const swissNow = moment().tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss");

    if (!poll.is_active) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Poll is inactive",
      });
    }

    if (poll.start_date && moment(swissNow).isBefore(moment(poll.start_date))) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Poll has not started yet",
      });
    }

    if (poll.end_date && moment(swissNow).isAfter(moment(poll.end_date))) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Poll has expired",
      });
    }

    if (!poll.allow_multiple && option_ids.length > 1) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Multiple voting is not allowed",
      });
    }

    const validOptionIds = poll.options.map((option) => option.id);

    const invalidOptions = option_ids.filter(
      (id) => !validOptionIds.includes(id),
    );

    if (invalidOptions.length > 0) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "Invalid poll option selected",
      });
    }

    const existingVote = await PollVote.findOne({
      where: {
        poll_id,
        [Op.or]: [...(user_id ? [{ user_id }] : []), { ip_address: req.ip }],
      },
      transaction,
    });

    if (existingVote) {
      await transaction.rollback();

      return res.status(400).json({
        status: "error",
        message: "You have already voted for this poll",
      });
    }

    const votePayload = option_ids.map((option_id) => ({
      poll_id,
      option_id,
      user_id: user_id || null,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
      voted_at: new Date(),
    }));

    await PollVote.bulkCreate(votePayload, {
      transaction,
    });

    await Poll.increment(
      {
        total_votes: option_ids.length,
      },
      {
        where: {
          id: poll_id,
        },
        transaction,
      },
    );

    await PollOption.increment(
      {
        vote_count: 1,
      },
      {
        where: {
          id: option_ids,
        },
        transaction,
      },
    );

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      message: "Vote submitted successfully",
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      status: "error",
      message: "Failed to submit vote",
      error: error.message,
    });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const { poll_id } = req.params;

    const poll = await Poll.findByPk(poll_id, {
      include: [
        {
          model: PollOption,
          as: "options",
        },
      ],
    });

    if (!poll) {
      return res.status(404).json({
        status: "error",
        message: "Poll not found",
      });
    }

    const votes = await PollVote.findAll({
      where: {
        poll_id,
      },
    });

    const totalVotes = votes.length;

    const results = poll.options.map((option) => {
      const optionVotes = votes.filter(
        (vote) => vote.option_id === option.id,
      ).length;

      return {
        id: option.id,
        option_text: option.option_text,
        votes: optionVotes,
        percentage:
          totalVotes > 0
            ? Number(((optionVotes / totalVotes) * 100).toFixed(2))
            : 0,
      };
    });

    return res.status(200).json({
      status: "success",
      data: {
        poll_id: poll.id,
        question: poll.question,
        total_votes: totalVotes,
        results,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch poll results",
      error: error.message,
    });
  }
};

exports.checkUserVote = async (req, res) => {
  try {
    const { poll_id } = req.params;

    const existingVote = await PollVote.findOne({
      where: {
        poll_id,
        [Op.or]: [
          { ip_address: req.ip },
          ...(req.query.user_id ? [{ user_id: req.query.user_id }] : []),
        ],
      },
      include: [
        {
          model: PollOption,
          as: "option",
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      voted: !!existingVote,
      data: existingVote || null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to check vote",
      error: error.message,
    });
  }
};
