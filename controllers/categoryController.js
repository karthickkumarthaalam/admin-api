const db = require("../models");
const { Category } = db;


exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(404).json({ status: "error", message: "Category Name is required" });
        }

        const existingCategory = await Category.findOne({ where: { category_name } });

        if (existingCategory) {
            return res.status(400).json({ status: "error", message: "Category Name already present" });
        }

        const category = await Category.create({
            category_name
        });

        return res.status(201).json({ status: "success", message: "Category created successfully", data: category });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Category", error: error.message });
    }
};


exports.listCategory = async (req, res) => {
    try {

        const list = await Category.findAll();

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