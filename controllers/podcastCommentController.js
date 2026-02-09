const db = require("../models");
const pagination = require("../utils/pagination");
const { PodcastComment, Podcast, Members, SystemUsers } = db;
const sendNotification = require("../services/sendNotification");

exports.addComment = async (req, res) => {
  try {
    const {
      podcast_id,
      member_id,
      guest_id,
      guest_name,
      guest_email,
      comment,
    } = req.body;

    if (!podcast_id || !comment) {
      return res
        .status(400)
        .json({ status: "error", message: "Need comment details" });
    }

    let member = null;

    if (member_id) {
      member = await Members.findOne({ where: { member_id: member_id } });
      if (!member) {
        return res
          .status(404)
          .json({ status: "error", message: "Member not found" });
      }
    }

    if (!member_id && !guest_id) {
      return res.status(400).json({
        status: "error",
        message: "Either member_id or guest_id is required",
      });
    }

    if (!member_id && guest_id && !guest_name) {
      return res.status(400).json({
        status: "error",
        message: "Guest name and email are required",
      });
    }

    const podcastComment = await PodcastComment.create({
      podcast_id,
      member_id: member ? member.id : null,
      guest_id: guest_id || null,
      guest_name: guest_name || null,
      guest_email: guest_email || null,
      comment,
      status: "pending",
    });

    try {
      const podcast = await Podcast.findByPk(podcast_id, {
        attributes: ["title"],
      });

      const commenterName = member ? member.name : guest_name || "Guest User";

      await sendNotification(req.app, {
        title: "New Podcast Comment",
        message: `${commenterName} commented on podcast "${
          podcast?.title || "Untitled"
        }"`,
        type: "comment",
        created_by: commenterName,
      });
    } catch (notifyErr) {
      console.error("Notification emit failed:", notifyErr.message);
    }

    return res.status(200).json({
      status: "success",
      message: "Comment posted successfully and is pending approval",
      podcastComment,
    });
  } catch (error) {
    console.log(error, "showing error");
    res.status(500).json({
      status: "error",
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

exports.commentList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { role, id } = req.user;

    let where = {};

    if (role !== "admin") {
      const systemUser = await SystemUsers.findOne({
        where: { user_id: id },
      });

      where["$Podcast.rjname$"] = systemUser.name;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    const result = await pagination(PodcastComment, {
      page,
      limit,
      where,
      include: [
        { model: Members, attributes: ["id", "name"] },
        { model: Podcast, attributes: ["id", "title", "rjname"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Podcast comments fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to List Comments",
      error: error.message,
    });
  }
};

exports.updateCommentStatus = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status" });
    }

    const podcastComment = await PodcastComment.findByPk(comment_id);

    if (!podcastComment) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast comment not found" });
    }

    podcastComment.status = status;
    await podcastComment.save();

    return res.status(200).json({
      status: "success",
      message: "Podcast comment status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update status",
      error: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await PodcastComment.findByPk(comment_id);
    if (!comment)
      return res
        .status(404)
        .json({ status: "error", message: "Comment not found" });

    await comment.destroy();

    return res
      .status(200)
      .json({ status: "success", message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

exports.getCommentByPodcast = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let where = {};

    where.podcast_id = req.params.id;
    if (req.query.status) {
      where.status = req.query.status;
    }

    const result = await pagination(PodcastComment, {
      page,
      limit,
      where,
      include: [
        {
          model: Members,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Comments fetched successfully",
      result,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};
