const db = require("../models");
const pagination = require("../utils/pagination");
const { NewsCategory, SystemUsers } = db;

exports.createNewsCategories = async (req, res) => {
  try {
    const { category_name, sub_categories } = req.body;

    const exisiting = await NewsCategory.findOne({
      where: {
        category_name,
        created_by: req.user.id,
      },
    });

    if (exisiting) {
      return res.status(400).json({ message: "Category name already exisits" });
    }

    const category = await NewsCategory.create({
      category_name,
      sub_categories,
      created_by: req.user.id,
    });

    return res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create News Categories",
      error: error.message,
    });
  }
};

exports.getCategoryList = async (req, res) => {
  try {
    const whereCondition = {};

    const categories = await NewsCategory.findAll({
      where: whereCondition,
      attributes: ["category_name"],
    });

    const categoryArray = categories.map((cat) => cat.category_name);

    res.status(200).json({
      status: "success",
      data: categoryArray,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to list category" });
  }
};

exports.getSubCategoriesByCategoryName = async (req, res) => {
  try {
    const { category_name } = req.params;

    const category = await NewsCategory.findOne({
      where: {
        category_name,
      },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      status: "success",
      category: category.category_name,
      subCategories: category.sub_categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { role, id } = req.user;

    const whereCondition = role === "admin" ? {} : { created_by: id };

    const result = await pagination(NewsCategory, {
      page,
      limit,
      where: whereCondition,
      include: [
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["name", "email"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to list categories" });
  }
};

exports.updateCategories = async (req, res) => {
  const { id } = req.params;
  const { category_name, sub_categories } = req.body;

  try {
    const category = await NewsCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({
      category_name,
      sub_categories,
    });

    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update Category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await NewsCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    return res.status(200).json({
      status: "success",
      message: "category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete categories",
      error: error.message,
    });
  }
};
