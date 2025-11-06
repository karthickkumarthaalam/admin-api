const db = require("../models");
const { NewsReaction, News } = db;

exports.addReaction = async (req, res) => {
  try {
    const { news_id, reaction, guest_id, member_id } = req.body;

    if (!news_id || !reaction) {
      return res.status(400).json({
        status: "error",
        message: "News_id and rection are required",
      });
    }

    const news = await News.findByPk(news_id);
    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "news not found",
      });
    }

    if (!member_id && !guest_id) {
      return res.status(400).json({
        status: "error",
        message: "Either member_id (authenticated) or guest_id is required",
      });
    }

    const whereCondition = member_id
      ? { news_id, member_id }
      : { news_id, guest_id };

    const exisiting = await NewsReaction.findOne({ where: whereCondition });

    let savedReaction;

    if (exisiting) {
      if (exisiting.reaction !== reaction) {
        await exisiting.update({ reaction });
      }
      savedReaction = exisitingReaction;
    } else {
      savedReaction = await NewsReaction.create({
        news_id,
        member_id,
        guest_id,
        reaction,
      });
    }

    const totalLikes = await NewsReaction.count({
      where: {
        news_id,
        reaction: "like",
      },
    });

    const totalDislikes = await NewsReaction.count({
      where: { news_id, reaction: "dislike" },
    });

    return res.status(200).json({
      status: "success",
      message: "Reaction added successfully",
      data: savedReaction,
      stats: {
        likes: totalLikes,
        dislikes: totalDislikes,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const { news_id, guest_id, member_id } = req.body;

    if (!news_id) {
      return res.status(400).json({
        status: "error",
        message: "news_id is required",
      });
    }

    const whereCondition = member_id
      ? { news_id, member_id }
      : { news_id, guest_id };

    const deleted = await NewsReaction.destroy({ where: whereCondition });

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Reaction not found",
      });
    }

    const totalLikes = await NewsReaction.count({
      where: { news_id, reaction: "like" },
    });
    const totalDislikes = await NewsReaction.count({
      where: { news_id, reaction: "dislike" },
    });

    return res.status(200).json({
      status: "success",
      message: "Reaction removed successfully",
      stats: {
        likes: totalLikes,
        dislikes: totalDislikes,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to remove reaction",
      error: error.message,
    });
  }
};

exports.getReactionsByNewsId = async (req, res) => {
  try {
    const { news_id } = req.params;

    const totalLikes = await NewsReaction.count({
      where: { news_id, reaction: "like" },
    });
    const totalDislikes = await NewsReaction.count({
      where: { news_id, reaction: "dislike" },
    });

    return res.status(200).json({
      status: "success",
      data: {
        news_id,
        likes: totalLikes,
        dislikes: totalDislikes,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching reactions:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reactions",
      error: error.message,
    });
  }
};
