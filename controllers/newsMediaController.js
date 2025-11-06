const db = require("../models");
const path = require("path");
const fs = require("fs");
const { News, NewsMedia } = db;
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

exports.createNewsMedia = async (req, res) => {
  try {
    const { news_id, type = "image", order_index = 0 } = req.body;
    const mediaFile = req.files?.media?.[0]; // expecting multer field: media

    if (!news_id) {
      return res.status(400).json({
        status: "error",
        message: "news_id is required",
      });
    }

    // Ensure the news exists (optional but good practice)
    const news = await News.findByPk(news_id);
    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found",
      });
    }

    let mediaUrl = null;

    // If file uploaded
    if (mediaFile) {
      const remoteFolder = "News/media-files";

      // Upload to cPanel server
      mediaUrl = await uploadToCpanel(
        mediaFile.path,
        remoteFolder,
        mediaFile.originalname
      );

      // Clean up local temp file
      try {
        if (fs.existsSync(mediaFile.path)) fs.unlinkSync(mediaFile.path);
      } catch (cleanupErr) {
        console.warn("⚠️ Failed to clean up temp file:", cleanupErr.message);
      }
    } else if (req.body.url) {
      // Support direct URL upload (optional)
      mediaUrl = req.body.url;
    } else {
      return res.status(400).json({
        status: "error",
        message: "No media file or URL provided",
      });
    }

    // Create DB entry
    const createdMedia = await NewsMedia.create({
      news_id,
      url: mediaUrl,
      type,
      order_index,
    });

    return res.status(201).json({
      status: "success",
      message: "News media uploaded successfully",
      data: createdMedia,
    });
  } catch (error) {
    console.error("❌ Error creating news media:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create News media",
      error: error.message,
    });
  }
};

exports.getNewsMediaByNewsId = async (req, res) => {
  try {
    const { news_id } = req.params;

    const mediaList = await NewsMedia.findAll({
      where: { news_id },
      order: [["order_index", "ASC"]],
    });
    return res.status(200).json({
      status: "success",
      count: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch News Medias",
      error: error.message,
    });
  }
};

exports.updateNewsMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, order_index } = req.body;
    const mediaFile = req.files?.media?.[0];

    const media = await NewsMedia.findByPk(id);

    if (!media) {
      return res.status(404).json({
        status: "error",
        message: "News media not found",
      });
    }

    const remoteFolder = "News/media-files";
    let updatedUrl = media.url;

    if (mediaFile) {
      const newFileName = mediaFile.originalname;
      const oldFileName = path.basename(media.url || "");

      if (newFileName !== oldFileName) {
        if (media.url) {
          try {
            await deleteFromCpanel(remoteFolder, oldFileName);
          } catch (err) {
            console.warn("⚠️ Failed to delete old media file:", err.message);
          }
        }

        updatedUrl = await uploadToCpanel(
          mediaFile.path,
          remoteFolder,
          mediaFile.originalname
        );
      }

      if (fs.existsSync(mediaFile.path)) fs.unlinkSync(mediaFile.path);
    } else if (req.body.url) {
      updatedUrl = req.body.url;
    }

    await media.update({
      url: updatedUrl,
      type: type || media.type,
      order_index: order_index ?? media.order_index,
    });

    res.status(200).json({
      status: "success",
      message: "News media updated successfully",
      data: media,
    });
  } catch (error) {
    console.error("❌ Error updating news media:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update News media",
      error: error.message,
    });
  }
};

exports.deleteNewsMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await NewsMedia.findByPk(id);
    if (!media) {
      return res
        .status(404)
        .json({ status: "error", message: "News media not found" });
    }

    // Delete file from cPanel if exists
    if (media.url) {
      const remoteFolder = "News/media-files";
      const fileName = path.basename(media.url);
      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete file from cPanel:", err.message);
      }
    }

    await media.destroy();

    return res.status(200).json({
      status: "success",
      message: "News media deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete news media",
      error: error.message,
    });
  }
};
