const db = require("../models");
const { Podcast, PodcastComment, Members, SystemUsers } = db;
const fs = require("fs");
const { Op, literal } = require("sequelize");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const pagination = require("../utils/pagination");
const formatTime = require("../utils/audioDurationFormater");
const { uploadToCpanel, deleteFromCpanel } = require("../services/uploadToCpanel");

exports.createPodcast = async (req, res) => {
    const imageFile = req.files["image"] ? req.files["image"][0] : null;
    const audioFile = req.files["audio"] ? req.files["audio"][0] : null;

    try {
        const { title, description, rjname, content, date, status, language, tags } = req.body;

        if (!audioFile) {
            return res.status(400).json({ status: "error", message: "Audio file is required" });
        }

        const durationInSeconds = await getAudioDurationInSeconds(audioFile.path);
        const formattedDuration = formatTime(durationInSeconds);

        const newPodcast = await Podcast.create({
            date,
            rjname,
            content,
            title,
            description,
            status: status || "active",
            tags,
            duration: formattedDuration,
            language,
            image_url: imageFile ? imageFile.path : null,
            audio_drive_file_id: null,
            audio_drive_file_link: null,
            created_by: req.user.id
        });

        res.status(201).json({
            status: "success",
            message: "Podcast created successfully",
            data: newPodcast,
        });

        try {
            const uploadedUrl = await uploadToCpanel(
                audioFile.path,
                "podcasts/audio",
                audioFile.originalname
            );

            await newPodcast.update({
                audio_drive_file_link: uploadedUrl
            });

            fs.unlinkSync(audioFile.path);
        } catch (uploadErr) {
            console.error("Background audio upload failed:", uploadErr.message);
        }

    } catch (error) {
        if (audioFile && fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
        res.status(500).json({
            status: "error",
            message: "Failed to create podcast",
            error: error.message
        });
    }
};

exports.getAllPodcasts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let where = {};

        if (req.query.status) {
            where.status = req.query.status;
        }

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;
            where[Op.or] = [
                { title: { [Op.like]: searchQuery } },
                { rjname: { [Op.like]: searchQuery } },
            ];
        }

        if (req.query.language) {
            where = {
                ...where,
                [Op.and]: literal(`JSON_CONTAINS(language, '["${req.query.language}"]')`),
            };
        }

        if (req.query.tag) {
            where = {
                ...where,
                [Op.and]: literal(`JSON_CONTAINS(tags, '["${req.query.tag}"]')`),
            };
        }

        if (req.isAuthenticated && req.user && req.user.role !== "admin") {
            const systemUser = await SystemUsers.findOne({
                where: {
                    user_id: req.user.id
                }
            });

            if (systemUser) {
                where.rjname = systemUser.name;
            }
        }

        const result = await pagination(Podcast, {
            page,
            limit,
            where,
            order: [["date", "DESC"]],
        });

        const podcastIds = result.data.map(p => p.id);

        if (podcastIds.length > 0) {
            const reactionCounts = await db.sequelize.query(`
        SELECT podcast_id, reaction, COUNT(*) as count
        FROM podcast_reactions
        WHERE podcast_id IN (:podcastIds)
        GROUP BY podcast_id, reaction
      `, {
                replacements: { podcastIds },
                type: db.Sequelize.QueryTypes.SELECT
            });

            const reactionMap = {};
            if (reactionCounts && reactionCounts.length > 0) {
                reactionCounts.forEach(rc => {
                    if (!reactionMap[rc.podcast_id]) reactionMap[rc.podcast_id] = {};
                    reactionMap[rc.podcast_id][rc.reaction] = parseInt(rc.count);
                });
            }

            result.data.forEach(podcast => {
                podcast.dataValues.reactions = reactionMap[podcast.id] || {};
            });
        }

        res.status(200).json({
            status: "success",
            message: "Podcasts fetched successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch podcasts",
            error: error.message,
        });
    }
};

exports.getPodcastById = async (req, res) => {
    try {
        const podcast = await Podcast.findByPk(req.params.id, {
            include: [
                {
                    model: PodcastComment,
                    where: {
                        status: "approved"
                    },
                    required: false,
                    include: [{
                        model: Members,
                        attributes: ["id", "name"]
                    }],
                    order: [["created_at", "DESC"]]
                }
            ]
        });

        if (!podcast) {
            return res.status(404).json({ status: "error", message: "Podcast not found" });
        }

        const reactionCounts = await db.sequelize.query(
            `SELECT reaction, COUNT(*) as count
   FROM podcast_reactions
   WHERE podcast_id = :podcastId
   GROUP BY reaction`, {
            replacements: { podcastId: req.params.id },
            type: db.Sequelize.QueryTypes.SELECT
        }
        );

        const reactionSummary = {};
        if (reactionCounts && reactionCounts.length > 0) {
            reactionCounts.forEach(row => {
                reactionSummary[row.reaction] = row.count;
            });
        }

        res.status(200).json({
            status: "success",
            message: "Podcast fetched successfully",
            podcast,
            reaction: reactionSummary || {}
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch podcast",
            error: error.message,
        });
    }
};

exports.updatePodcastStatus = async (req, res) => {
    try {
        const podcast = await Podcast.findByPk(req.params.id);
        if (!podcast) {
            return res.status(404).json({ status: "error", message: "Podcast not found" });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ status: "error", message: "Status is required" });
        }

        podcast.status = status;
        await podcast.save();

        res.status(200).json({
            status: "success",
            message: "Podcast status updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update status",
            error: error.message,
        });
    }
};
exports.getPodcastReactions = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const [data] = await db.sequelize.query(`
      SELECT 
        p.id, 
        p.title, 
        p.rjname,
        (SELECT COUNT(*) FROM podcast_reactions r WHERE r.podcast_id = p.id AND r.reaction = 'like') AS likes,
        (SELECT COUNT(*) FROM podcast_comments c WHERE c.podcast_id = p.id) AS comments
      FROM podcasts p
      ORDER BY p.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

        const [[{ total }]] = await db.sequelize.query(`SELECT COUNT(*) as total FROM podcasts`);

        res.status(200).json({
            status: "success",
            data,
            totalRecords: total
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};


exports.updatePodcast = async (req, res) => {
    const imageFile = req.files["image"] ? req.files["image"][0] : null;
    const audioFile = req.files["audio"] ? req.files["audio"][0] : null;
    try {
        const podcast = await Podcast.findByPk(req.params.id);
        if (!podcast) {
            return res.status(404).json({ status: "error", message: "Podcast not found" });
        }

        const { date, rjname, content, title, description, status, language, tags } = req.body;

        podcast.date = date || podcast.date;
        podcast.rjname = rjname || podcast.rjname;
        podcast.content = content || podcast.content;
        podcast.title = title || podcast.title;
        podcast.description = description || podcast.description;
        podcast.status = status || podcast.status;
        podcast.language = language || podcast.language;
        podcast.tags = tags || podcast.tags;

        if (imageFile) {
            if (podcast.image_url && fs.existsSync(podcast.image_url)) {
                fs.unlinkSync(podcast.image_url);
            }
            podcast.image_url = imageFile.path;
        }

        await podcast.save();

        res.status(200).json({
            status: "success",
            message: "Podcast updated successfully",
            data: podcast
        });

        if (audioFile) {
            (async () => {
                try {
                    if (podcast.audio_drive_file_link) {
                        const fileName = podcast.audio_drive_file_link.split("/").pop();
                        await deleteFromCpanel("podcast/audio", fileName);
                    }

                    const uploadedUrl = await uploadToCpanel(
                        audioFile.path,
                        "podcasts/audio",
                        audioFile.originalname
                    );
                    const durationInSeconds = await getAudioDurationInSeconds(audioFile.path);
                    const formattedDuration = formatTime(durationInSeconds);

                    await podcast.update({
                        duration: formattedDuration,
                        audio_drive_file_link: uploadedUrl
                    });

                    fs.unlinkSync(audioFile.path);
                } catch (err) {
                    console.error("Audio upload/duration update failed:", err.message);
                }
            })();
        }
    } catch (error) {
        if (audioFile && fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
        if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
        res.status(500).json({ status: "error", message: "Failed to update podcast", error: error.message });
    }
};

exports.deletePodcast = async (req, res) => {
    try {
        const podcast = await Podcast.findByPk(req.params.id);
        if (!podcast) {
            return res.status(404).json({ status: "error", message: "Podcast not found" });
        }

        if (podcast.image_url && fs.existsSync(podcast.image_url)) {
            fs.unlinkSync(podcast.image_url);
        }

        const audioDrivelink = podcast.audio_drive_file_link;

        await podcast.destroy();

        res.status(200).json({
            status: "success",
            message: "Podcast deleted successfully"
        });

        if (audioDrivelink) {
            const fileName = audioDrivelink.split("/").pop();
            await deleteFromCpanel("podcasts/audio", fileName);
        }

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to delete podcast", error: error.message });
    }
};


exports.streamAudio = async (req, res) => {
    const fileName = req.params.fileName;
    if (!fileName) return res.status(400).send("Filename is required");

    const audioUrl = `https://thaalam.ch/podcast/audio/${fileName}`;
    return res.redirect(audioUrl);
};

exports.getMetaData = async (req, res) => {
    const { id } = req.params;
    try {
        const podcast = await Podcast.findByPk(id);

        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        res.json({
            title: podcast.title,
            description: podcast.description,
            image: podcast.image_url,
        });

    }
    catch (error) {
        res.status(500).json({ message: "Failed to Get Meta data", error: error.message });
    }
};