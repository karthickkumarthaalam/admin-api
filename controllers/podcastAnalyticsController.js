const db = require("../models");
const { PodcastAnalytics, Podcast, PodcastComment } = db;
const { Op, Sequelize } = require("sequelize");

exports.getPodcastAnalytics = async (req, res) => {
  try {
    const podcast_id = req.params.id;

    if (!podcast_id) {
      return res.status(400).json({
        success: false,
        message: "Podcast ID is required",
      });
    }

    const analytics = await PodcastAnalytics.findOne({
      where: {
        podcast_id,
      },
      attributes: ["play_count", "like_count", "shares_count"],
    });

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch podcast analytics",
    });
  }
};

exports.getSimplePodcastReport = async (req, res) => {
  try {
    const { creator_id } = req.params;
    const { startDate, endDate } = req.query;

    if (!creator_id) {
      return res.status(400).json({
        success: false,
        message: "Creator ID is required",
      });
    }

    const dateFilter =
      startDate || endDate
        ? {
            date: {
              ...(startDate && { [Op.gte]: new Date(startDate) }),
              ...(endDate && { [Op.lte]: new Date(endDate) }),
            },
          }
        : {};

    const where = {
      podcast_creator_id: creator_id,
      ...dateFilter,
    };

    const totalPodcasts = await Podcast.count({ where });

    const totals = await PodcastAnalytics.findOne({
      attributes: [
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn("SUM", Sequelize.col("play_count")),
            0,
          ),
          "totalPlays",
        ],
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn("SUM", Sequelize.col("like_count")),
            0,
          ),
          "totalLikes",
        ],
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn("SUM", Sequelize.col("shares_count")),
            0,
          ),
          "totalShares",
        ],
      ],
      include: [
        {
          model: Podcast,
          attributes: [],
          where,
          required: true,
        },
      ],
      raw: true,
    });

    const totalComments = await PodcastComment.count({
      include: [
        {
          model: Podcast,
          where,
        },
      ],
    });

    const topPodcasts = await Podcast.findAll({
      where,
      attributes: ["id", "title", "date", "image_url"],
      include: [
        {
          model: PodcastAnalytics,
          attributes: ["play_count", "like_count"],
          required: false,
        },
      ],
      order: [
        [{ model: PodcastAnalytics }, "play_count", "DESC"],
        [{ model: PodcastAnalytics }, "like_count", "DESC"],
      ],
      limit: 10,
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPodcasts,
          totalViews: Number(totals?.totalPlays || 0),
          totalLikes: Number(totals?.totalLikes || 0),
          totalShares: Number(totals?.totalShares || 0),
          totalComments,
        },
        topPodcasts: topPodcasts.map((p) => ({
          id: p.id,
          title: p.title,
          date: p.date,
          thumbnail: p.image_url,
          plays: p.PodcastAnalytic?.play_count || 0,
          likes: p.PodcastAnalytic?.like_count || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Simple podcast report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch podcast report",
    });
  }
};
