const db = require("../models");
const { Category, SystemUsers } = db;


exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(404).json({ status: "error", message: "Category Name is required" });
        }

        const existingCategory = await Category.findOne({ where: { category_name, created_by: req.user.id } });

        if (existingCategory) {
            return res.status(400).json({ status: "error", message: "Category Name already present" });
        }

        const category = await Category.create({
            category_name,
            created_by: req.user.id
        });

        return res.status(201).json({ status: "success", message: "Category created successfully", data: category });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Category", error: error.message });
    }
};


exports.listCategory = async (req, res) => {
    try {

        const { role, id } = req.user;

        const whereCondition = {};

        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        const list = await Category.findAll({
            where: whereCondition,
            include: [
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name"]
                }
            ]
        });

        return res.status(200).json({
            status: "success",
            message: "Category list fetched successfully",
            data: list
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Category Name",
            error: error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { category_name } = req.body;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ status: "error", message: "Category not found" });
        }

        const existingCategory = await Category.findOne({ where: { category_name, created_by: req.user.id } });

        if (existingCategory) {
            return res.status(400).json({ status: "error", message: "Category Name already present" });
        }

        category.category_name = category_name;
        await category.save();

        return res.status(200).json({ status: "success", message: "category updated successfully" });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update Category",
            error: error.message
        });
    }
};


exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ status: "error", message: "Category not found" });
        }

        await category.destroy();
        return res.status(200).json({ status: "success", message: "category deleted successfully" });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to delete Category",
            error: error.message
        });
    }
};