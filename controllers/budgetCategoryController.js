const db = require("../models");
const pagination = require("../utils/pagination");
const { BudgetCategory, SystemUsers } = db;

exports.createCategory = async (req, res) => {
    try {
        const { category_name, subCategories } = req.body;

        const existing = await BudgetCategory.findOne({
            where: {
                category_name,
                created_by: req.user.id
            }
        });

        if (existing) {
            return res.status(400).json({ status: "error", message: "Category name already exists" });
        }

        const category = await BudgetCategory.create({
            category_name,
            subCategories,
            created_by: req.user.id
        });

        return res.status(201).json({ status: "success", message: "category created successfully", category });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Category", error: error.message });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { role, id } = req.user;

        const whereCondition = role === "admin"
            ? {}
            : { created_by: id };


        const results = await pagination(BudgetCategory, {
            page,
            limit,
            where: whereCondition,
            include: [
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name", "email"]
                }
            ],
            order: [['id', 'DESC']],
        });

        return res.status(200).json({
            status: "success",
            message: "Categories fetched successfully",
            data: results.data,
            pagination: results.pagination
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to list categories",
            error: error.message,
        });
    }
};

exports.getSubCategoriesByCategoryName = async (req, res) => {
    try {
        const { category_name } = req.params;

        const category = await BudgetCategory.findOne({
            where: { category_name },
        });

        if (!category) {
            return res.status(404).json({
                status: "error",
                message: "Category not found",
            });
        }

        return res.status(200).json({
            status: "success",
            category: category.category_name,
            subCategories: category.subCategories,
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch subcategories",
            error: error.message,
        });
    }
};


exports.updateCategories = async (req, res) => {
    const { id } = req.params;
    const { category_name, subCategories } = req.body;

    try {
        const category = await BudgetCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({ status: "error", message: "categories not found" });
        }

        await category.update({
            category_name,
            subCategories
        });

        return res.status(200).json({
            status: "success",
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update Category", error: error.message });
    }
};

exports.deleteCategories = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await BudgetCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ status: "error", messsage: "Categories not found" });
        }

        await category.destroy();

        return res.status(200).json({
            status: "success",
            message: "category deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "failed to delete Categories",
            error: error.message
        });
    }
};