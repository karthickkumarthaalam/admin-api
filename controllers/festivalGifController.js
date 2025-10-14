const fs = require("fs");
const path = require("path");
const db = require("../models");
const { FestivalGif } = db;

// Utility function to delete existing file safely
const deleteFileIfExists = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// ✅ Create or Update Festival GIFs (only one record at a time)
exports.createOrUpdateFestivalGif = async (req, res) => {
  try {
    const leftImage = req.files?.left_side_image
      ? req.files.left_side_image[0].path
      : null;
    const rightImage = req.files?.right_side_image
      ? req.files.right_side_image[0].path
      : null;

    if (!leftImage && !rightImage) {
      return res.status(400).json({
        status: "error",
        message: "At least one image (left or right) is required.",
      });
    }

    let festivalGif = await FestivalGif.findOne();

    // If record exists, update it
    if (festivalGif) {
      if (leftImage) {
        deleteFileIfExists(festivalGif.left_side_image);
        festivalGif.left_side_image = leftImage;
      }

      if (rightImage) {
        deleteFileIfExists(festivalGif.right_side_image);
        festivalGif.right_side_image = rightImage;
      }

      if (req.body.status !== undefined) {
        festivalGif.status = req.body.status;
      }

      await festivalGif.save();

      return res.status(200).json({
        status: "success",
        message: "Festival GIF updated successfully.",
        data: festivalGif,
      });
    }

    // Otherwise, create a new record
    festivalGif = await FestivalGif.create({
      left_side_image: leftImage,
      right_side_image: rightImage,
      status: req.body.status ?? true,
    });

    return res.status(201).json({
      status: "success",
      message: "Festival GIF created successfully.",
      data: festivalGif,
    });
  } catch (error) {
    console.error("Error creating/updating FestivalGif:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create or update Festival GIF.",
      error: error.message,
    });
  }
};

// ✅ Delete Festival GIF
exports.deleteFestivalGif = async (req, res) => {
  const { id } = req.params;

  try {
    const festivalGif = await FestivalGif.findByPk(id);

    if (!festivalGif) {
      return res
        .status(404)
        .json({ status: "error", message: "Festival GIF not found." });
    }

    deleteFileIfExists(festivalGif.left_side_image);
    deleteFileIfExists(festivalGif.right_side_image);

    await festivalGif.destroy();

    return res.status(200).json({
      status: "success",
      message: "Festival GIF deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting FestivalGif:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete Festival GIF.",
      error: error.message,
    });
  }
};

// ✅ List all Festival GIFs
exports.listFestivalGifs = async (req, res) => {
  try {
    const { status } = req.query;
    const whereConditions = {};

    if (status !== undefined) {
      whereConditions.status = status === "true";
    }

    const gifs = await FestivalGif.findAll({ where: whereConditions });

    return res.status(200).json({
      status: "success",
      data: gifs,
    });
  } catch (error) {
    console.error("Error listing FestivalGifs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Festival GIFs.",
      error: error.message,
    });
  }
};

// ✅ Update status only
exports.updateFestivalGifStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (status === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Status is required (true or false).",
      });
    }

    const festivalGif = await FestivalGif.findOne();

    if (!festivalGif) {
      return res.status(404).json({
        status: "error",
        message: "No Festival GIF found to update.",
      });
    }

    festivalGif.status = status;
    await festivalGif.save();

    return res.status(200).json({
      status: "success",
      message: `Festival GIF status updated to '${status}'.`,
      data: festivalGif,
    });
  } catch (error) {
    console.error("Error updating FestivalGif status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update Festival GIF status.",
      error: error.message,
    });
  }
};
