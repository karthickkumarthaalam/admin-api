const db = require("../models");
const pagination = require("../utils/pagination");
const { AgreementCategory } = db;

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: "Category Name is required" });
    }

    const exising = await AgreementCategory.findOne({
      where: { category_name },
    });

    if (exising) {
      return res.status(400).json({ message: "Category Name already exists" });
    }

    const category = await AgreementCategory.create({
      category_name,
      created_by: req?.user?.id || null,
    });

    res
      .status(201)
      .json({ message: "category created successfully", data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create Category", error: error.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await pagination(AgreementCategory, {
      page,
      limit,
    });

    res.status(200).json({
      message: "Categories fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to list categories", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: "Category  name is required" });
    }

    const category = await AgreementCategory.findByPk(id);

    if (!category) {
      return res.status(400).json({ message: "Category not exists" });
    }

    category.category_name = category_name ?? category.category_name;
    await category.save();

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to Update Category", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await AgreementCategory.findByPk(id);

    if (!category) {
      return res.status(400).json({ message: "Category Not Found" });
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: error.message });
  }
};

exports.restoreCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await AgreementCategory.findByPk(id, { paranoid: false });
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await category.restore();
    res
      .status(200)
      .json({ message: "Category restored successfully", data: category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to restore category", error: error.message });
  }
};
