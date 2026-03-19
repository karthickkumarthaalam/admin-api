const {
  FlashNews,
  ProgramCategory,
  ProgramCategoryFlashNews,
} = require("../models");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");

/**
 * Create Flash News
 */
exports.createFlashNews = async (req, res) => {
  try {
    const {
      title,
      news_content,
      start_date,
      end_date,
      priority,
      status,
      category_ids,
    } = req.body;

    const flashNews = await FlashNews.create({
      title,
      news_content,
      start_date,
      end_date,
      priority,
      status,
    });

    if (category_ids && category_ids.length > 0) {
      const mappings = category_ids.map((categoryId) => ({
        program_category_id: categoryId,
        flash_news_id: flashNews.id,
      }));

      await ProgramCategoryFlashNews.bulkCreate(mappings);
    }

    res.status(201).json({
      message: "Flash news created successfully",
      data: flashNews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Flash News
 */
exports.getFlashNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const whereCondition = {};

    if (req.query.search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { news_content: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const result = await pagination(FlashNews, {
      page,
      limit,
      where: whereCondition,
      include: [
        {
          model: ProgramCategory,
          as: "categories",
          attributes: ["id", "category"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Flash news fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Flash News By Program
 */
exports.getFlashNewsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const now = new Date();

    const flashNews = await FlashNews.findAll({
      include: [
        {
          model: ProgramCategory,
          as: "categories",
          where: { id: categoryId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
      where: {
        status: "active",
        [Op.and]: [
          {
            [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: now } }],
          },
          {
            [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: now } }],
          },
        ],
      },
      order: [["priority", "ASC"]],
    });

    res.json(flashNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFlashNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "in-active"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const flashNews = await FlashNews.findByPk(id);

    if (!flashNews) {
      return res.status(404).json({
        message: "Flash news not found",
      });
    }

    await flashNews.update({ status });

    res.json({
      message: "Flash news status updated successfully",
      data: flashNews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update Flash News
 */
exports.updateFlashNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      news_content,
      start_date,
      end_date,
      priority,
      status,
      category_ids,
    } = req.body;

    const flashNews = await FlashNews.findByPk(id);

    if (!flashNews) {
      return res.status(404).json({ message: "Flash news not found" });
    }

    await flashNews.update({
      title,
      news_content,
      start_date,
      end_date,
      priority,
      status,
    });

    if (category_ids) {
      await ProgramCategoryFlashNews.destroy({
        where: { flash_news_id: id },
      });

      const mappings = category_ids.map((categoryId) => ({
        program_category_id: categoryId,
        flash_news_id: id,
      }));

      await ProgramCategoryFlashNews.bulkCreate(mappings);
    }

    res.json({
      message: "Flash news updated successfully",
      data: flashNews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Flash News
 */
exports.deleteFlashNews = async (req, res) => {
  try {
    const { id } = req.params;

    const flashNews = await FlashNews.findByPk(id);

    if (!flashNews) {
      return res.status(404).json({ message: "Flash news not found" });
    }

    await flashNews.destroy();

    res.json({
      message: "Flash news deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
