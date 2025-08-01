const db = require("../models");
const pagination = require("../utils/pagination");
const { PodcastComment, Podcast, Members, SystemUsers } = db;

exports.addComment = async (req, res) => {
    try {
        const { podcast_id, member_id, comment } = req.body;

        if (!podcast_id || !member_id || !comment) {
            return res.status(400).json({ status: "error", message: "Need comment details" });
        }

        const member = await Members.findOne({
            where: { member_id }
        });

        if (!member) {
            return res.status(404).json({ status: "error", message: "Member Not found" });
        }

        const postedComment = await PodcastComment.create({
            podcast_id,
            member_id: member.id,
            comment,
            status: "pending"  // fixed typo
        });

        return res.status(200).json({ status: "success", message: "Comment posted successfully", postedComment });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to add comment", error: error.message });
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
                where: { user_id: id }
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
                { model: Members, attributes: ['id', 'name'] },
                { model: Podcast, attributes: ['id', 'title', "rjname"] }
            ],
            order: [["created_at", "DESC"]]
        });

        res.status(200).json({ status: "success", message: "Podcast comments fetched successfully", data: result });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to List Comments", error: error.message });
    }
};

exports.updateCommentStatus = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ status: "error", message: "Invalid status" });
        }

        const podcastComment = await PodcastComment.findByPk(comment_id);

        if (!podcastComment) {
            return res.status(404).json({ status: "error", message: "Podcast comment not found" });
        }

        podcastComment.status = status;
        await podcastComment.save();

        return res.status(200).json({ status: "success", message: "Podcast comment status updated successfully" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to update status", error: error.message });
    }
};


exports.deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;

        const comment = await PodcastComment.findByPk(comment_id);
        if (!comment) return res.status(404).json({ status: "error", message: "Comment not found" });

        await comment.destroy();

        return res.status(200).json({ status: "success", message: "Comment deleted successfully" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to delete comment", error: error.message });
    }
};


exports.getCommentByPodcast = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let where = {};

        where.podcast_id = req.params.id;
        where.status = "approved";

        const result = await pagination(PodcastComment, {
            page,
            limit,
            where,
            include: [
                {
                    model: Members,
                    attributes: ["id", "name"]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        res.status(200).json({
            status: "success",
            message: "Comments fetched successfully",
            result
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch comments", error: error.message });
    }
};