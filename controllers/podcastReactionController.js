const db = require("../models");
const { PodcastReaction } = db;

exports.addorupdateReaction = async (req, res) => {
    try {
        const { podcast_id, member_id, guest_id, reaction } = req.body;

        if (!podcast_id) {
            return res.status(400).json({ status: "error", message: "Podcast required" });
        }

        let member;

        if (member_id) {
            member = await db.Members.findOne({
                where: {
                    member_id
                }
            });
        }

        const whereCondition = { podcast_id };

        if (member_id) {
            whereCondition.member_id = member.id;
        } else if (guest_id) {
            whereCondition.guest_id = guest_id;
        }

        const existingReaction = await PodcastReaction.findOne({
            where: whereCondition
        });

        if (existingReaction) {
            if (existingReaction.reaction == reaction) {
                await existingReaction.destroy();
                return res.status(200).json({ status: "success", message: "Reaction removed successfully" });
            } else {
                existingReaction.reaction = reaction;
                await existingReaction.save();
                return res.status(200).json({ status: "success", message: "Reaction updated successfully" });
            }
        }

        await PodcastReaction.create({
            podcast_id,
            member_id: member.id || null,
            guest_id: guest_id || null,
            reaction
        });

        res.status(200).json({ status: "success", message: "Reaction added successfully" });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to add or update reaction",
            error: error.message
        });
    }
};


exports.getReactionCountsByPodcastId = async (req, res) => {
    try {
        const { podcastId } = req.params;

        const reactionCounts = await db.sequelize.query(`
      SELECT reaction, COUNT(*) as count
      FROM podcast_reactions
      WHERE podcast_id = :podcastId
      GROUP BY reaction
    `, {
            replacements: { podcastId },
            type: db.Sequelize.QueryTypes.SELECT
        });

        const reactionMap = {};
        if (reactionCounts && reactionCounts.length > 0) {
            reactionCounts.forEach(rc => {
                reactionMap[rc.reaction] = parseInt(rc.count);
            });
        }

        res.status(200).json({
            status: "success",
            reactions: reactionMap
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch reaction counts",
            error: error.message
        });
    }
};
