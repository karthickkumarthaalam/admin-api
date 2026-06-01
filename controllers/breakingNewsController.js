const { Op } = require("sequelize");
const { BreakingNews } = require("../models");
const pagination = require("../utils/pagination");
const moment = require("moment");

exports.createBreakingNews = async (req, res) => {
  try {
    const { content, url, start_date, end_date, is_active } = req.body;

    if (!content || !start_date || !end_date) {
      return res.status(400).json({
        message: "required all fields",
      });
    }

    const breakingNews = await BreakingNews.create({
      content,
      url: url || "",
      start_date,
      end_date,
      is_active: is_active || false,
    });

    return res.status(201).json({
      message: "Breaking news created successfully",
      data: breakingNews,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAllBreakingNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {};

    if (req.query.isActive) {
      whereCondition.is_active = req.query.isActive === "true";
    }

    if (req.query.search) {
      whereCondition[Op.or] = [
        { content: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const results = await pagination(BreakingNews, {
      page,
      limit,
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: "Breaking news fetched successfully",
      data: results.data,
      pagination: results.pagination,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await BreakingNews.findByPk(id);

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "Breaking News not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const { content, url, start_date, end_date, is_active } = req.body;

    const news = await BreakingNews.findByPk(id);

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "news not found",
      });
    }

    news.content = content || news.content;
    news.url = url || news.url;
    news.start_date = start_date || news.start_date;
    news.end_date = end_date || news.end_date;
    news.is_active = is_active ?? news.is_active;
    await news.save();

    return res.status(200).json({
      status: "success",
      message: "Breaking news updated successfully",
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await BreakingNews.findByPk(id);

    if (!news) {
      return res.status(404).json({
        status: "error",
        message: "news not found",
      });
    }

    await news.destroy();

    return res.status(200).json({
      status: "success",
      message: "Breaking news deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getActiveNews = async (req, res) => {
  try {
    const swissNow = moment().tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss");

    const activeNews = await BreakingNews.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: swissNow },
        end_date: { [Op.gte]: swissNow },
      },
      order: [["start_date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: activeNews,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
