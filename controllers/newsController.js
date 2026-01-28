const db = require("../models");
const { News, NewsMedia, SystemUsers } = db;
const slugify = require("../utils/slugify");
const pagination = require("../utils/pagination");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

exports.createNews = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      title,
      subtitle,
      published_by,
      rj_id,
      content_creator,
      content,
      country,
      state,
      city,
      status,
      video_url,
      audio_url,
      published_date,
    } = req.body;

    if (!category || !title || !content) {
      return res.status(400).json({ message: "Need all required fields" });
    }

    const created_by = req.user?.id || null;

    const slug = slugify(title);

    const coverfile = req.files?.cover_image?.[0];

    let coverUrl = null;

    if (coverfile) {
      const remoteFolder = "News/cover-images";
      coverUrl = await uploadToCpanel(
        coverfile.path,
        remoteFolder,
        coverfile.originalname,
      );

      if (fs.existsSync(coverfile.path)) {
        fs.unlinkSync(coverfile.path);
      }
    }

    const news = await News.create(
      {
        category,
        subcategory,
        title,
        subtitle,
        slug,
        content,
        published_by,
        rj_id,
        content_creator,
        country,
        state,
        city,
        published_date,
        status: status || "draft",
        cover_image: coverUrl,
        video_url,
        audio_url,
        created_by,
      },
      {
        returning: true,
      },
    );

    res
      .status(201)
      .json({ status: "success", messaage: "News Created successfully", news });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create news",
      error: error.message,
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.date) {
      whereCondition.published_date = req.query.date;
    }

    if (req.query.category) {
      whereCondition.category = req.query.category;
    }
    if (req.user && req.user.role !== "admin") {
      const systemUser = await SystemUsers.findOne({
        where: {
          user_id: req.user.id,
        },
      });
      whereCondition.published_by = systemUser?.name || "Admin";
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { subtitle: { [Op.like]: `%${search}%` } },
      ];
    }

    const result = await pagination(News, {
      page,
      limit,
      include: [
        {
          model: NewsMedia,
          as: "media",
        },
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "News Fetched successfiully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to list news",
      error: error.message,
    });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category,
      subcategory,
      title,
      subtitle,
      content,
      published_by,
      rj_id,
      content_creator,
      country,
      state,
      city,
      status,
      video_url,
      audio_url,
      published_date,
    } = req.body;

    const news = await News.findByPk(id);

    if (!news) {
      return res
        .status(404)
        .json({ status: "error", message: "News not found" });
    }

    // 🧩 Handle new cover image if provided
    const coverfile = req.files?.cover_image?.[0];
    let coverUrl = news.cover_image;

    if (coverfile) {
      const remoteFolder = "News/cover-images";
      const newFileName = coverfile.originalname;
      const oldFileName = path.basename(news.cover_image || "");

      // ✅ Only replace if different filename (or you can compare hashes)
      if (newFileName !== oldFileName) {
        // Delete old one from cPanel (if exists)
        if (news.cover_image) {
          try {
            await deleteFromCpanel(remoteFolder, oldFileName);
          } catch (err) {
            console.warn("⚠️ Failed to delete old cover:", err.message);
          }
        }

        // Upload new one
        coverUrl = await uploadToCpanel(
          coverfile.path,
          remoteFolder,
          coverfile.originalname,
        );
      }

      // ✅ Always remove temp file after upload attempt
      if (fs.existsSync(coverfile.path)) fs.unlinkSync(coverfile.path);
    }

    let slug = news.slug;
    if (title && title !== news.title) {
      slug = slugify(title);
    }

    await news.update({
      category,
      subcategory,
      title,
      subtitle,
      slug,
      content,
      published_by,
      rj_id,
      content_creator,
      country,
      state,
      city,
      published_date,
      status: status || news.status,
      cover_image: coverUrl,
      video_url,
      audio_url,
    });

    res.status(200).json({
      status: "success",
      message: "News updated successfully",
      news,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update news",
      error: error.message,
    });
  }
};

exports.updateNewsStatus = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found",
      });
    }

    const { status } = req.body;

    const allowed = ["draft", "published", "archived"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Status",
      });
    }

    const statusUpdater = await SystemUsers.findOne({
      where: {
        user_id: req.user.id,
      },
      attributes: ["name"],
    });

    // ✅ Update status and store admin name + timestamp
    news.status = status;
    news.status_updated_by = (statusUpdater && statusUpdater?.name) || "Admin";
    news.status_updated_at = new Date();

    await news.save();

    res.status(200).json({
      status: "success",
      message: "News status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to updated news status",
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id, {
      include: [
        { model: SystemUsers, as: "creator", attributes: ["id", "name"] },
        { model: NewsMedia, as: "media" },
      ],
    });

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: news,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to list News",
      error: error.message,
    });
  }
};

exports.getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await News.findOne({
      where: {
        slug,
      },
      include: [
        { model: SystemUsers, as: "creator", attributes: ["id", "name"] },
        { model: NewsMedia, as: "media" },
      ],
    });

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: news,
    });
  } catch (error) {
    console.log(error, "showing error in server");
    return res.status(500).json({
      status: "error",
      message: "Failed to list News",
      error: error.message,
    });
  }
};

exports.getRelatedNews = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4; // default limit = 4
    const status = req.query.status;

    const newsList = await News.findAll({
      where: { category, status },
      limit,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      data: newsList,
    });
  } catch (error) {
    console.error("Error fetching related news:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch related news",
      error: error.message,
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id);

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "News not found",
      });
    }

    if (news.cover_image) {
      const remoteFolder = "News/cover-images";
      const fileName = path.basename(news.cover_image);
      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("Failed to delete old cover image:", err.message);
      }
    }

    await NewsMedia.destroy({ where: { news_id: id } });

    await news.destroy();

    res.status(200).json({
      status: "success",
      message: "News deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete news",
      error: error.message,
    });
  }
};
