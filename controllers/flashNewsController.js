const {
  FlashNews,
  FlashNewsItem,
  ProgramCategory,
  ProgramCategoryFlashNews,
  sequelize,
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
      start_date,
      end_date,
      priority,
      status,
      category_ids,
      items,
    } = req.body;

    const flashNews = await FlashNews.create({
      title,
      start_date,
      end_date,
      priority,
      status,
    });

    // ✅ create items
    if (items && items.length > 0) {
      const itemData = items.map((item) => ({
        flash_news_id: flashNews.id,
        content: item.content,
        status: item.status || "in-active",
      }));

      await FlashNewsItem.bulkCreate(itemData);
    }

    // categories (same)
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
    const offset = (page - 1) * limit;

    let whereCondition = {};

    // 🔍 Search filter
    if (req.query.search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // ✅ Main query with pagination
    const { count, rows } = await FlashNews.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ProgramCategory,
          as: "categories",
          attributes: ["id", "category"],
          through: { attributes: [] },
        },
        {
          model: FlashNewsItem,
          as: "items",
          attributes: ["id", "content", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      message: "Flash news fetched successfully",
      data: rows,
      pagination: {
        totalRecords: count,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching flash news",
      error: error.message,
    });
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
        {
          model: FlashNewsItem,
          as: "items",
          where: { status: "active" },
          required: false,
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

exports.updateFlashNewsItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "in-active"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'active' or 'in-active'",
      });
    }

    const item = await FlashNewsItem.findByPk(id);

    if (!item) {
      return res.status(404).json({
        message: "Flash news item not found",
      });
    }

    await item.update({ status });

    res.json({
      message: "Flash news item status updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Update Flash News
 */
exports.updateFlashNews = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      title,
      start_date,
      end_date,
      priority,
      status,
      category_ids,
      items = [],
    } = req.body;

    const flashNews = await FlashNews.findByPk(id, { transaction: t });

    if (!flashNews) {
      await t.rollback();
      return res.status(404).json({ message: "Flash news not found" });
    }

    await flashNews.update(
      { title, start_date, end_date, priority, status },
      { transaction: t },
    );

    if (items) {
      const existingItems = await FlashNewsItem.findAll({
        where: { flash_news_id: id },
        transaction: t,
      });

      const existingItemIds = existingItems.map((i) => i.id);

      const incomingItemIds = items.filter((i) => i.id).map((i) => i.id);

      const itemsToDelete = existingItemIds.filter(
        (id) => !incomingItemIds.includes(id),
      );

      if (itemsToDelete.length > 0) {
        await FlashNewsItem.destroy({
          where: { id: { [Op.in]: itemsToDelete } },
          transaction: t,
        });
      }

      for (const item of items) {
        if (item.id) {
          await FlashNewsItem.update(
            {
              content: item.content,
              status: item.status || "in-active",
            },
            {
              where: { id: item.id },
              transaction: t,
            },
          );
        } else {
          await FlashNewsItem.create(
            {
              flash_news_id: id,
              content: item.content,
              status: item.status || "in-active",
            },
            { transaction: t },
          );
        }
      }
    }
    if (category_ids) {
      await ProgramCategoryFlashNews.destroy({
        where: { flash_news_id: id },
        transaction: t,
      });

      const mappings = category_ids.map((categoryId) => ({
        program_category_id: categoryId,
        flash_news_id: id,
      }));

      await ProgramCategoryFlashNews.bulkCreate(mappings, {
        transaction: t,
      });
    }

    await t.commit();

    res.json({
      message: "Flash news updated successfully",
      data: flashNews,
    });
  } catch (error) {
    await t.rollback();
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
