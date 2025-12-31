const db = require("../models");
const { Podcast, PodcastComment, Members, SystemUsers } = db;
const fs = require("fs");
const { Op, literal } = require("sequelize");
const { getAudioDurationInSeconds } = require("get-audio-duration");
const pagination = require("../utils/pagination");
const formatTime = require("../utils/audioDurationFormater");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

const r2upload = require("../services/uploadToR2");
const slugify = require("../utils/slugify");
const category = require("../models/category");

function extractR2KeyFromUrl(url, type = "audio") {
  if (!url) return null;
  const pub = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (pub && url.startsWith(pub)) {
    return url.replace(`${pub}/`, "");
  }
  const fileName = url.split("/").pop();
  return `podcasts/${type}/${fileName}`;
}

exports.createPodcast = async (req, res) => {
  const imageFile = req.files?.image?.[0] || null;

  try {
    const {
      title,
      description,
      rj_id,
      content,
      date,
      status,
      language,
      tags,
      category_id,
    } = req.body;

    let imageLink = null;

    // Upload image to cPanel
    if (imageFile && imageFile.path) {
      imageLink = await uploadToCpanel(
        imageFile.path,
        "podcasts/image",
        imageFile.originalname
      );

      // Remove local temp file
      if (fs.existsSync(imageFile.path)) {
        fs.unlinkSync(imageFile.path);
      }
    }
    const rj = await SystemUsers.findByPk(rj_id);
    if (!rj) {
      return res.status(404).json({ status: "error", message: "Invalid RJ" });
    }
    const slug = slugify(title);

    const newPodcast = await Podcast.create({
      date,
      rj_id,
      rjname: rj.name,
      content,
      title,
      slug,
      description,
      status: status || "pending",
      tags,
      language,
      image_url: imageLink,
      audio_drive_file_link: null,
      duration: null,
      created_by: req.user.id,
      category_id: category_id || null,
    });

    res.status(201).json({
      status: "success",
      message: "Podcast created successfully",
      data: newPodcast,
    });
  } catch (error) {
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlinkSync(imageFile.path);
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.uploadPodcastVideo = async (req, res) => {
  const videoFile = req.files?.video?.[0] || null;

  try {
    const podcast = await Podcast.findByPk(req.params.id);

    if (!podcast) {
      // cleanup temp file
      if (videoFile?.path && fs.existsSync(videoFile.path)) {
        fs.unlinkSync(videoFile.path);
      }
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    if (!videoFile) {
      return res
        .status(400)
        .json({ status: "error", message: "Video required" });
    }

    // delete old video from R2 if exists
    if (podcast.video_link) {
      try {
        const oldKey = extractR2KeyFromUrl(podcast.video_link, "video");
        if (oldKey) await r2upload.deleteFromR2(oldKey);
      } catch (deleteError) {
        console.error(
          "Warning: failed to delete old video from R2:",
          deleteError.message
        );
      }
    }

    const keyFolder = "podcasts/video";

    // upload new video
    const videoUrl = await r2upload.uploadToR2(
      videoFile.path,
      keyFolder,
      videoFile.originalname
    );

    // update DB
    await podcast.update({ video_link: videoUrl });

    // remove temp file
    if (videoFile.path && fs.existsSync(videoFile.path)) {
      fs.unlinkSync(videoFile.path);
    }

    res.status(200).json({
      status: "success",
      message: "Video updated successfully",
      data: podcast,
    });
  } catch (error) {
    // cleanup temp file on failure
    if (videoFile?.path && fs.existsSync(videoFile.path)) {
      fs.unlinkSync(videoFile.path);
    }
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.uploadPodcastAudio = async (req, res) => {
  const audioFile = req.files?.audio?.[0] || null;

  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) {
      if (audioFile && audioFile.path && fs.existsSync(audioFile.path))
        fs.unlinkSync(audioFile.path);
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    if (!audioFile) {
      return res
        .status(400)
        .json({ status: "error", message: "Audio required" });
    }

    if (podcast.audio_drive_file_link) {
      try {
        const oldKey = extractR2KeyFromUrl(podcast.audio_drive_file_link);
        if (oldKey) await r2upload.deleteFromR2(oldKey);
      } catch (err) {
        console.error(
          "Warning: failed to delete old audio from R2:",
          err.message
        );
      }
    }

    const keyFolder = "podcasts/audio";
    const audioUrl = await r2upload.uploadToR2(
      audioFile.path,
      keyFolder,
      audioFile.originalname
    );
    let formattedDuration = null;
    try {
      const durationSeconds = await getAudioDurationInSeconds(audioFile.path);
      formattedDuration = formatTime(durationSeconds);
    } catch (err) {
      console.error("Failed to compute audio duration:", err.message);
    }

    await podcast.update({
      audio_drive_file_link: audioUrl,
      duration: formattedDuration,
    });

    try {
      if (fs.existsSync(audioFile.path)) fs.unlinkSync(audioFile.path);
    } catch (e) {}

    return res.json({
      status: "success",
      message: "Audio uploaded",
      audio: audioUrl,
      data: podcast,
    });
  } catch (error) {
    try {
      if (audioFile && audioFile.path && fs.existsSync(audioFile.path))
        fs.unlinkSync(audioFile.path);
    } catch (e) {}
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deletePodcastVideo = async (req, res) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);

    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    // delete from R2
    if (podcast.video_link) {
      try {
        const key = extractR2KeyFromUrl(podcast.video_link, "video");
        if (key) await r2upload.deleteFromR2(key);
      } catch (deleteError) {
        console.error(
          "Warning: failed to delete video from R2:",
          deleteError.message
        );
      }
    }

    // update DB
    await podcast.update({ video_link: null });

    return res
      .status(200)
      .json({ status: "success", message: "Video deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deletePodcastAudio = async (req, res) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    if (podcast.audio_drive_file_link) {
      try {
        const key = extractR2KeyFromUrl(podcast.audio_drive_file_link);
        if (key) await r2upload.deleteFromR2(key);
      } catch (err) {
        console.error("Warning: failed to delete audio from R2:", err.message);
        // continue and clear DB fields anyway
      }
    }

    await podcast.update({ audio_drive_file_link: null, duration: null });

    return res.json({ status: "success", message: "Audio deleted" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updatePodcast = async (req, res) => {
  const imageFile = req.files?.image?.[0] || null;

  try {
    const podcast = await Podcast.findByPk(req.params.id);

    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    const {
      date,
      rj_id,
      content,
      title,
      description,
      status,
      language,
      tags,
      category_id,
    } = req.body;

    const slug = slugify(title);

    let imageLink = podcast.image_url; // keep old image if not replaced

    // If RJ is changed
    if (rj_id) {
      const rj = await SystemUsers.findByPk(rj_id);

      if (!rj) {
        return res.status(400).json({ status: "error", message: "Invalid RJ" });
      }

      podcast.rj_id = rj_id;
      podcast.rjname = rj.name;
    }

    // If new image uploaded → upload to cPanel
    if (imageFile && imageFile.path) {
      // Delete existing image from cPanel if exists
      if (podcast.image_url) {
        const oldImageName = podcast.image_url.split("/").pop();
        await deleteFromCpanel("podcasts/image", oldImageName);
      }

      imageLink = await uploadToCpanel(
        imageFile.path,
        "podcasts/image",
        imageFile.originalname
      );

      // Remove temp local uploaded file
      if (fs.existsSync(imageFile.path)) {
        fs.unlinkSync(imageFile.path);
      }
    }

    // Update metadata
    podcast.date = date || podcast.date;
    podcast.content = content || podcast.content;
    podcast.slug = slug || podcast.slug;
    podcast.title = title || podcast.title;
    podcast.description = description || podcast.description;
    podcast.status = status || podcast.status;
    podcast.language = language || podcast.language;
    podcast.tags = tags || podcast.tags;
    podcast.image_url = imageLink;
    podcast.category_id = category_id || podcast.category_id;

    await podcast.save();

    res.status(200).json({
      status: "success",
      message: "Podcast updated successfully",
      data: podcast,
    });
  } catch (error) {
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlinkSync(imageFile.path);
    }
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updatePodcastStatus = async (req, res) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ status: "error", message: "Status is required" });
    }

    const allowed = ["pending", "reviewing", "approved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid status. Allowed values: ${allowed.join(", ")}`,
      });
    }

    // ✅ Lookup admin using user_id (token shared as req.user.id)
    const statusUpdater = await SystemUsers.findOne({
      where: {
        user_id: req.user.id,
      },
      attributes: ["name"],
    });

    // ✅ Update status and store admin name + timestamp
    podcast.status = status;
    podcast.status_updated_by =
      (statusUpdater && statusUpdater?.name) || "Admin";
    podcast.status_updated_at = new Date();

    await podcast.save();

    res.status(200).json({
      status: "success",
      message: "Podcast status updated successfully",
      updatedStatus: podcast.status,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update status",
      error: error.message,
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

    if (req.query.category_id) {
      where.category_id = req.query.category_id;
    }

    if (req.query.not_category_id) {
      where[Op.or] = [
        { category_id: { [Op.not]: req.query.not_category_id } },
        { category_id: { [Op.is]: null } },
      ];
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
        [Op.and]: literal(
          `JSON_CONTAINS(language, '["${req.query.language}"]')`
        ),
      };
    }

    if (req.isAuthenticated && req.user && req.user.role !== "admin") {
      const systemUser = await SystemUsers.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (systemUser) {
        where.rjname = systemUser.name;
      }
    }

    const result = await pagination(Podcast, {
      page,
      limit,
      where,
      include: [
        {
          model: db.PodcastCategory,
          as: "category",
          attributes: ["name"],
          required: false,
        },
      ],
      order: [["date", "DESC"]],
    });

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
          model: db.PodcastCategory,
          as: "category",
          attributes: ["name", "image_url", "description"],
          required: false,
        },
      ],
    });

    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    const reactionCounts = await db.sequelize.query(
      `SELECT reaction, COUNT(*) as count
   FROM podcast_reactions
   WHERE podcast_id = :podcastId
   GROUP BY reaction`,
      {
        replacements: { podcastId: req.params.id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const reactionSummary = {};
    if (reactionCounts && reactionCounts.length > 0) {
      reactionCounts.forEach((row) => {
        reactionSummary[row.reaction] = row.count;
      });
    }

    const prev = await db.sequelize.query(
      `SELECT id, slug FROM podcasts
      WHERE id < :podcastId
      ORDER BY id DESC
      LIMIT 1`,
      {
        replacements: { podcastId: req.params.id },
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    const next = await db.sequelize.query(
      `SELECT id, slug FROM podcasts
       WHERE id > :podcastId
       ORDER BY id ASC
       LIMIT 1`,
      {
        replacements: { podcastId: req.params.id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      status: "success",
      message: "Podcast fetched successfully",
      podcast,
      reaction: reactionSummary || {},
      prevPodcast: prev[0] || null,
      nextPodcast: next[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch podcast",
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

    const [[{ total }]] = await db.sequelize.query(
      `SELECT COUNT(*) as total FROM podcasts`
    );

    res.status(200).json({
      status: "success",
      data,
      totalRecords: total,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getMetaData = async (req, res) => {
  const { slug } = req.params;
  try {
    const podcast = await Podcast.findOne({
      where: {
        slug,
      },
    });

    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }

    res.json({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      image: podcast.image_url,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to Get Meta data", error: error.message });
  }
};

exports.deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);

    if (!podcast) {
      return res
        .status(404)
        .json({ status: "error", message: "Podcast not found" });
    }

    if (podcast.image_url) {
      const imageName = podcast.image_url.split("/").pop();

      try {
        await deleteFromCpanel("podcasts/image", imageName);
      } catch (err) {
        console.error("Failed to delete image from cPanel:", err.message);
      }
    }

    if (podcast.audio_drive_file_link) {
      try {
        const key = extractR2KeyFromUrl(podcast.audio_drive_file_link);
        if (key) await r2upload.deleteFromR2(key);
      } catch (err) {
        console.error("Failed to delete audio from R2:", err.message);
      }
    }

    await podcast.destroy();

    res.status(200).json({
      status: "success",
      message: "Podcast deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete podcast",
      error: error.message,
    });
  }
};
