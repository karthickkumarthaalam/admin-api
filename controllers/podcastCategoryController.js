const fs = require("fs");
const db = require("../models");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");
const path = require("path");
const pagination = require("../utils/pagination");
const { PodcastCategory } = db;

exports.createCategory = async (req, res) => {
  const image = req.files?.image?.[0] || null;

  try {
    const {
      name,
      description = null,
      created_by_type = "system",
      system_user_id = null,
      podcast_creator_id = null,
    } = req.body;

    // Validate input
    if (!name) {
      if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
      return res
        .status(400)
        .json({ status: "error", message: "Category name is required" });
    }

    let image_url = null;

    // Upload image if exists
    if (image && image.path) {
      image_url = await uploadToCpanel(
        image.path,
        "podcasts/category",
        image.originalname
      );
      if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
    }

    // Build category payload
    const payload = {
      name,
      description,
      image_url,
      created_by_type,
      system_user_id: created_by_type === "system" ? system_user_id : null,
      podcast_creator_id:
        created_by_type === "creator" ? podcast_creator_id : null,
    };

    const newCategory = await PodcastCategory.create(payload);

    return res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error(error);

    if (image && image.path && fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create category",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  const image = req.files?.image?.[0] || null;
  const { id } = req.params;
  const body = req.body || {};

  try {
    const { name, description } = body;
    const category = await PodcastCategory.findOne({ where: { id } });

    if (!category) {
      if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
      return res.status(404).json({ message: "Category not found" });
    }

    let image_url = category.image_url;
    const remoteFolder = "podcasts/category";

    if (!image && req.body.image_url === "") {
      const oldFileName = path.basename(image_url || "");
      if (image_url) {
        try {
          await deleteFromCpanel(remoteFolder, oldFileName);
        } catch (err) {
          console.warn("⚠️ Failed to delete old image:", err.message);
        }
      }
      image_url = null;
    }

    if (image && image.path) {
      const newFileName = image.originalname;
      const oldFileName = path.basename(image_url || "");

      if (newFileName !== oldFileName && image_url) {
        try {
          await deleteFromCpanel(remoteFolder, oldFileName);
        } catch (err) {
          console.warn("⚠️ Failed to delete old image:", err.message);
        }
      }

      image_url = await uploadToCpanel(image.path, remoteFolder, newFileName);
      if (fs.existsSync(image.path)) fs.unlinkSync(image.path);
    }

    const updatedCategory = await category.update({
      name,
      image_url,
      description,
    });

    res
      .status(200)
      .json({
        message: "Category updated successfully",
        data: updatedCategory,
      });
  } catch (error) {
    console.log(error);
    if (image && image.path && fs.existsSync(image.path))
      fs.unlinkSync(image.path);
    res
      .status(500)
      .json({ message: "Failed to update category", error: error.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let whereCondition = {};

    if (req.isAuthenticated) {
      const requesterType = req.query.type;
      const requesterId = +req.query.user_id || null;

      if (requesterType === "admin") {
      } else if (requesterType === "system" && requesterId) {
        whereCondition.system_user_id = requesterId;
      } else if (requesterType === "creator" && requesterId) {
        whereCondition.podcast_creator_id = requesterId;
      }
    }

    const result = await pagination(PodcastCategory, {
      page,
      limit,
      where: whereCondition,
    });

    res.status(200).json({
      message: "Category fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to list category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await PodcastCategory.findOne({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.image_url) {
      const fileName = path.basename(category.image_url);
      try {
        await deleteFromCpanel("podcasts/category", fileName);
      } catch (err) {
        console.warn("⚠️ Cpanel delete failed:", err.message);
      }
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};
