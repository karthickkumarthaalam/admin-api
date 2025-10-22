const db = require("../models");
const { Op } = require("sequelize");
const { PodcastReaction, Members } = db;

exports.addorupdateReaction = async (req, res) => {
  try {
    const { podcast_id, member_id, guest_id, reaction } = req.body;
    if (!podcast_id || !reaction) {
      return res.status(400).json({
        status: "error",
        message: "Podcast ID and reaction type are required",
      });
    }

    if (reaction !== "like") {
      return res.status(400).json({
        status: "error",
        message: "Only 'like' reactions are allowed",
      });
    }

    const podcast = await db.Podcast.findByPk(podcast_id);
    if (!podcast) {
      return res.status(404).json({
        status: "error",
        message: "Podcast not found",
      });
    }

    let member;
    if (member_id) {
      member = await db.Members.findOne({
        where: { member_id },
      });
      if (!member) {
        return res.status(404).json({
          status: "error",
          message: "Member not found",
        });
      }
    }

    const whereCondition = { podcast_id, reaction: "like" };

    if (member_id) {
      whereCondition.member_id = member.id;
    } else if (guest_id) {
      whereCondition.guest_id = guest_id;
    } else {
      return res.status(400).json({
        status: "error",
        message: "Either member_id or guest_id is required",
      });
    }

    // Check if user already liked this podcast
    const existingReaction = await PodcastReaction.findOne({
      where: whereCondition,
    });
    if (existingReaction) {
      return res.status(400).json({
        status: "error",
        message: "You already liked this podcast",
        already_liked: true,
      });
    }

    // Create new reaction
    await PodcastReaction.create({
      podcast_id,
      member_id: member?.id || null,
      guest_id: guest_id || null,
      reaction,
    });

    // Get updated reaction count
    const likeCount = await PodcastReaction.count({
      where: { podcast_id, reaction: "like" },
    });

    res.status(200).json({
      status: "success",
      message: "Reaction added successfully",
      like_count: likeCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};

exports.getReactionCountsByPodcastId = async (req, res) => {
  try {
    const { podcastId } = req.params;

    const reactionCounts = await db.sequelize.query(
      `
      SELECT reaction, COUNT(*) as count
      FROM podcast_reactions
      WHERE podcast_id = :podcastId
      GROUP BY reaction
    `,
      {
        replacements: { podcastId },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const reactionMap = {};
    if (reactionCounts && reactionCounts.length > 0) {
      reactionCounts.forEach((rc) => {
        reactionMap[rc.reaction] = parseInt(rc.count);
      });
    }

    res.status(200).json({
      status: "success",
      reactions: reactionMap,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reaction counts",
      error: error.message,
    });
  }
};

exports.getUserReaction = async (req, res) => {
  try {
    const { id, member_id } = req.params;

    if (!id || !member_id) {
      return res.status(400).json({
        status: "error",
        message: "podcast Id and Member Id is required",
      });
    }

    const member = await Members.findOne({ where: { member_id: member_id } });

    if (!member) {
      return res
        .status(400)
        .json({ status: "error", message: "Member not found" });
    }

    const reaction = await PodcastReaction.findOne({
      where: {
        podcast_id: id,
        member_id: member.id,
      },
    });

    return res.json({
      status: "success",
      reaction: reaction ? reaction.reaction : null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server Error while fetching reactions",
      error: error.message,
    });
  }
};
