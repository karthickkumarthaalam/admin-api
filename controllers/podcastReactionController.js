const db = require("../models");
const { Op } = require("sequelize");
const {
  PodcastReaction,
  Members,
  PodcastView,
  PodcastAnalytics,
  PodcastShare,
} = db;
const getClientIp = require("../utils/getClientIp");

exports.addorupdateReaction = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { podcast_id, member_id, guest_id, reaction } = req.body;

    if (!podcast_id || reaction !== "like") {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Valid podcast_id and 'like' reaction are required",
      });
    }

    if (!member_id && !guest_id) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Either member_id or guest_id is required",
      });
    }

    const podcast = await db.Podcast.findByPk(podcast_id);
    if (!podcast) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Podcast not found",
      });
    }

    let member = null;
    if (member_id) {
      member = await db.Members.findOne({
        where: { member_id },
      });
      if (!member) {
        await t.rollback();
        return res.status(404).json({
          status: "error",
          message: "Member not found",
        });
      }
    }

    const whereCondition = {
      podcast_id,
      reaction: "like",
      ...(member ? { member_id: member.id } : { guest_id }),
    };

    const existingReaction = await PodcastReaction.findOne({
      where: whereCondition,
    });

    if (existingReaction) {
      await t.rollback();
      return res.status(200).json({
        status: "success",
        already_liked: true,
        message: "You already liked this podcast",
      });
    }

    // Create reaction
    await PodcastReaction.create(
      {
        podcast_id,
        member_id: member?.id || null,
        guest_id: guest_id || null,
        reaction: "like",
      },
      { transaction: t },
    );

    // Increment analytics instead of recounting
    await PodcastAnalytics.increment("like_count", {
      where: { podcast_id },
      transaction: t,
    });

    await t.commit();

    // Fetch updated count from analytics
    const analytics = await PodcastAnalytics.findOne({
      where: { podcast_id },
      attributes: ["like_count"],
    });

    return res.status(200).json({
      status: "success",
      message: "Reaction added successfully",
      like_count: analytics.like_count,
    });
  } catch (error) {
    await t.rollback();
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
      },
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

exports.addPodcastView = async (req, res) => {
  try {
    const podcast_id = req.params.id;

    const { member_id, guest_id } = req.body;

    if (!podcast_id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    if (!member_id && !guest_id) {
      return res.status(400).json({
        success: false,
        message: "Either member_id or guest_id is required",
      });
    }

    const podcast = await db.Podcast.findByPk(podcast_id);

    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    const COOLDOWN_MINUTES = 30;

    const whereCondition = {
      podcast_id,
      viewed_at: {
        [Op.gt]: new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000),
      },
    };

    if (member_id) {
      whereCondition.member_id = member_id;
    } else {
      whereCondition.guest_id = guest_id;
    }

    const alreadyViewed = await PodcastView.findOne({
      where: whereCondition,
    });

    if (alreadyViewed) {
      return res.status(200).json({
        success: true,
        counted: false,
        message: "View already counted recently",
      });
    }

    const ipAddress = getClientIp(req);

    await PodcastView.create({
      podcast_id,
      member_id: member_id || null,
      guest_id: guest_id || null,
      ip_address: ipAddress,
    });

    await PodcastAnalytics.increment("play_count", {
      where: { podcast_id },
    });

    return res.status(200).json({
      success: true,
      counted: true,
      message: "Podcast view counted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to count podcast view",
    });
  }
};

exports.addPodcastShare = async (req, res) => {
  try {
    const podcast_id = req.params.id;
    const { member_id, guest_id, platform } = req.body;

    if (!podcast_id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Share platform is required",
      });
    }

    if (!member_id && !guest_id) {
      return res.status(400).json({
        success: false,
        message: "Either member_id or guest_id is required",
      });
    }

    const podcast = await db.Podcast.findByPk(podcast_id);
    if (!podcast) {
      return res.status(404).json({
        success: false,
        message: "Podcast not found",
      });
    }

    const whereCondition = {
      podcast_id,
      platform,
    };

    if (member_id) {
      whereCondition.member_id = member_id;
    } else {
      whereCondition.guest_id = guest_id;
    }

    const alreadyShared = await PodcastShare.findOne({
      where: whereCondition,
    });

    if (alreadyShared) {
      return res.status(200).json({
        success: true,
        counted: false,
        message: "Podcast already shared on this platform",
      });
    }

    await PodcastShare.create({
      podcast_id,
      member_id: member_id || null,
      guest_id: guest_id || null,
      platform,
    });

    await PodcastAnalytics.increment("shares_count", {
      where: { podcast_id },
    });

    return res.status(200).json({
      success: true,
      counted: true,
      message: "Podcast shared successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to share podcast",
    });
  }
};
